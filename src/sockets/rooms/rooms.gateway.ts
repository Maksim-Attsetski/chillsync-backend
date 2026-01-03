import { Injectable, Scope } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMovieDto, MovieReactionService } from 'src/api';
import { RoomStoreService, TRoomMovie } from 'src/api/rooms';
import { TmdbService } from 'src/api/tmdb/tmdb.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'rooms' })
@Injectable({ scope: Scope.DEFAULT })
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Record<string, Socket> = {}; // client.id → userId

  constructor(
    private readonly moviesReactionService: MovieReactionService,
    private readonly tmdbService: TmdbService,
    private readonly roomService: RoomStoreService,
  ) {}

  handleConnection(client: Socket) {
    console.log('✅ Клиент подключился:', client.id, client.handshake.auth);
    this.clients[client.handshake.auth?.userId] = client;
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      delete this.clients[userId];
      console.log('❌ Клиент отключился:', client.id, userId);
    }

    // void this.removeUserFromRooms(userId);
  }

  private async removeUserFromRooms(userId: string) {
    const rooms = await this.roomService.findByUser(userId);
    for (const room of rooms) {
      room.users = room.users.filter((u) => u !== userId);
      delete room.genresSelections[userId];
      delete room.movieSelections[userId];

      room.markModified('genresSelections');
      room.markModified('movieSelections');
      await room.save();

      this.server.to(String(room._id)).emit('user_left', { userId });

      if (room.users.length === 0) {
        console.log('❌ Клиент вышел:', room?._id, userId);
        await this.roomService.remove(String(room._id));
      }
    }
  }

  /** Получить комнату пользователя */
  @SubscribeMessage('get_room')
  async handleGetRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const rooms = await this.roomService.findByUser(data.userId);
    const room = rooms?.at(0);

    return { event: 'room_received', data: room };
  }

  /** Создать комнату */
  @SubscribeMessage('create_room')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const response = await this.roomService.create({
      creator_id: data.userId,
      users: [data.userId],
      movies: [],
      genresSelections: {},
      movieSelections: {},
    });

    console.log(response);

    await client.join(String(response._id));

    return {
      event: 'room_created',
      data: { roomId: response._id, creator_id: data.userId },
    };
  }

  /** Присоединиться к комнате */
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    const room = await this.roomService.findOne(data.roomId);
    if (!room) return { event: 'error', data: 'Room not found' };

    if (!room.users.includes(data.userId)) {
      room.users.push(data.userId);
      await this.roomService.update(String(room._id), { users: room.users });
    }

    await client.join(data.roomId);

    this.server.to(data.roomId).emit('joined_room', {
      roomId: data.roomId,
      userId: data.userId,
      users: room.users,
    });
  }

  /** Начать событие → рассылаем жанры */
  @SubscribeMessage('event_start')
  async handleEventStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = await this.roomService.findOne(data.roomId);
    if (!room) return;

    const sockets = await this.server.in(data.roomId).fetchSockets();
    console.log(
      'SOCKETS IN ROOM:',
      sockets.map((s) => s.id),
    );

    if (sockets.length !== room?.users?.length) {
      console.warn('Client not in room, forcing join');
      await Promise.allSettled(
        room?.users?.map((id) => this.clients[id]?.join?.(String(room?._id))),
      );
    }

    const genres = await this.tmdbService.getGenres();

    this.server.to(data.roomId).emit('genres_list', genres.genres);
  }

  /** Клиенты выбрали жанры */
  @SubscribeMessage('event_genres_selected')
  async handleGenresSelected(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; genreIds: number[]; userId: string },
  ) {
    const room = await this.roomService.findOne(data.roomId);
    if (!room) return;

    room.genresSelections[data.userId] = data.genreIds;
    room.markModified('genresSelections');
    await room.save();

    const allSelected = room.users.every((u) => room.genresSelections[u]);
    if (!allSelected) return;

    const res = await this.moviesReactionService.findMoviesForUserList(
      room.users,
      Array.from(Object.values(room.genresSelections)).flat().join(','),
    );

    room.movies = res?.data?.map((m) => String(m.id));
    await room.save();

    this.server.to(data.roomId).emit('movies_list', res?.data);
  }

  /** Юзер выбрал фильмы */
  @SubscribeMessage('event_movies_selected')
  async handleMoviesSelected(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { roomId: string; movies: TRoomMovie[]; userId: string },
  ) {
    const room = await this.roomService.findOne(data.roomId);
    if (!room) return;

    room.movieSelections[data.userId] = data.movies;
    room.markModified('movieSelections');
    await room.save();

    const allSelected = room.users.every((u) => room.movieSelections[u]);
    if (!allSelected) return;

    const movieVotes: Record<number, { movie: TRoomMovie; likes: number }> = {};
    for (const userId of room.users) {
      const selections = room.movieSelections[userId] ?? [];
      for (const sel of selections) {
        if (sel.reaction === 'LIKE') {
          if (!movieVotes[sel.id])
            movieVotes[sel.id] = { movie: sel, likes: 0 };
          movieVotes[sel.id].likes += 1;
        }
      }
    }

    const needed = Math.ceil(room.users.length * 0.8);
    const winners = Object.values(movieVotes)
      .filter((m) => m.likes >= needed)
      .map((m) => m.movie);

    await Promise.allSettled(
      room.users.map((id) =>
        this.moviesReactionService.createMany(
          room.movieSelections[id] as CreateMovieDto[],
          id,
        ),
      ),
    );

    this.server.to(data.roomId).emit('event_results', winners);
  }

  /** Выход пользователя / закрытие комнаты */
  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.handshake.auth?.userId;
    if (!userId) return;
    delete this.clients[userId];

    const room = await this.roomService.findOne(data.roomId);
    if (!room) return;

    room.users = room.users.filter((u) => u !== userId);
    delete room.genresSelections[userId];
    delete room.movieSelections[userId];
    room.markModified('genresSelections');
    room.markModified('movieSelections');
    await room.save();

    this.server.to(data.roomId).emit('user_left', { userId });
    this.server.in(data.roomId).socketsLeave(data.roomId);

    if (room.users.length === 0) {
      console.log('❌ Клиент вышел:', room?._id, userId);
      await this.roomService.remove(data.roomId);
    }
  }

  /** Закрыть комнату */
  @SubscribeMessage('close_room')
  async handleCloseRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = await this.roomService.findOne(data.roomId);
    if (!room) return;

    for (const userId of room.users) {
      if (userId) delete this.clients[userId];
    }

    this.server.to(data.roomId).emit('room_closed');
    console.log('❌ Клиент вышел:', room?._id);
    await this.roomService.remove(data.roomId);
  }

  /** Перезапуск комнаты (обнуление фильмов и жанров) */
  @SubscribeMessage('reload_room')
  async handleReloadRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = await this.roomService.findOne(data.roomId);
    if (!room) return;

    room.genresSelections = {};
    room.movieSelections = {};
    room.movies = [];

    room.markModified('genresSelections');
    room.markModified('movieSelections');
    await room.save();

    this.server.to(data.roomId).emit('genres_list', []);
  }
}
