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
import { ERoomEmits, ERoomEvents } from 'src/types';

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

  handleError(err: unknown) {
    return { event: ERoomEvents.ERROR, data: (err as any)?.message ?? err };
  }

  async handleConnection(client: Socket) {
    console.log('✅ Клиент подключился:', client.id, client.handshake.auth);

    const userId = client.handshake.auth?.userId;
    const roomId = client.handshake.auth?.roomId;

    if (userId) {
      this.clients[userId] = client;

      try {
        if (roomId) {
          const room = await this.roomService.findOne(roomId);
          if (room && !room?.users?.includes(userId)) {
            await this.handleJoinRoom(client, { roomId, userId });
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth?.userId;
    if (userId) {
      delete this.clients[userId];
      console.log('❌ Клиент отключился:', client.id, userId);
    }

    void this.removeUserFromRooms(userId, client.handshake.auth?.roomId);
  }

  private async removeUserFromRooms(userId: string, roomId?: string) {
    const rooms = await this.roomService.findByUser(userId);

    const curRooms = roomId
      ? rooms?.data?.filter((r) => r._id?.toString() === roomId)
      : rooms.data;

    for (const room of curRooms) {
      room.users = room.users.filter((u) => u !== userId);
      delete room.genresSelections[userId];
      delete room.movieSelections[userId];

      room.markModified('genresSelections');
      room.markModified('movieSelections');
      await room.save();

      this.server
        .to(String(room._id))
        .emit(ERoomEmits.USER_LEFT, { userId, roomId });
    }
  }

  /** Получить комнату пользователя */
  // @SubscribeMessage('get_room')
  // async handleGetRoom(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: { userId: string },
  // ) {
  //   const rooms = await this.roomService.findByUser(data.userId);
  //   const room = rooms?.data?.at?.(0);

  //   return { event: 'room_received', data: room };
  // }

  /** Создать комнату */
  @SubscribeMessage(ERoomEvents.CREATE_ROOM)
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    try {
      const response = await this.roomService.create({
        creator_id: data.userId,
        users: [data.userId],
        movies: [],
        genresSelections: {},
        movieSelections: {},
      });

      console.log(response);

      await client.join(String(response._id));

      return { event: ERoomEmits.ROOM_CREATED, data: response };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Присоединиться к комнате */
  @SubscribeMessage(ERoomEvents.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    try {
      const room = await this.roomService.findOne(data.roomId);
      if (!room) return this.handleCreateRoom(client, data);

      if (!room.users.includes(data.userId)) {
        room.users.push(data.userId);
        await this.roomService.update(String(room._id), { users: room.users });
      }

      await client.join(data.roomId);

      this.server.to(data.roomId).emit(ERoomEmits.ROOM_REPLENISHED, {
        roomId: data.roomId,
        userId: data.userId,
        users: room.users,
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Начать событие → рассылаем жанры */
  @SubscribeMessage(ERoomEvents.START_EVENT)
  async handleEventStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
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

      this.server
        .to(data.roomId)
        .emit(ERoomEmits.GENRES_LIST_UPDATED, genres.genres);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Клиенты выбрали жанры */
  @SubscribeMessage(ERoomEvents.GENRES_SELECTED)
  async handleGenresSelected(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; genreIds: number[]; userId: string },
  ) {
    try {
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

      this.server
        .to(data.roomId)
        .emit(ERoomEmits.MOVIES_LIST_UPDATED, res?.data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Юзер выбрал фильмы */
  @SubscribeMessage(ERoomEvents.MOVIES_SELECTED)
  async handleMoviesSelected(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { roomId: string; movies: TRoomMovie[]; userId: string },
  ) {
    try {
      const room = await this.roomService.findOne(data.roomId);
      if (!room) return;

      room.movieSelections[data.userId] = data.movies;
      room.markModified('movieSelections');
      await room.save();

      const allSelected = room.users.every((u) => room.movieSelections[u]);
      if (!allSelected) return;

      const movieVotes: Record<number, { movie: TRoomMovie; likes: number }> =
        {};
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

      this.server.to(data.roomId).emit(ERoomEmits.EVENT_RESULTS, winners);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Выход пользователя / закрытие комнаты */
  @SubscribeMessage(ERoomEvents.LEAVE_ROOM)
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const userId = client.handshake.auth?.userId;
      if (!userId) return this.handleError('Вы не авторизованы');
      delete this.clients[userId];

      const room = await this.roomService.findOne(data.roomId);
      if (!room) return;

      room.users = room.users.filter((u) => u !== userId);
      delete room.genresSelections[userId];
      delete room.movieSelections[userId];
      room.markModified('genresSelections');
      room.markModified('movieSelections');

      await room.save();

      this.server.to(data.roomId).emit(ERoomEmits.USER_LEFT, { userId });
      this.server.in(data.roomId).socketsLeave(data.roomId);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Закрыть комнату */
  @SubscribeMessage(ERoomEvents.CLOSE_ROOM)
  async handleCloseRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const room = await this.roomService.findOne(data.roomId);
      if (!room) return;

      for (const userId of room.users) {
        if (userId) delete this.clients[userId];
      }

      console.log('❌ Клиент закрыл комнату:', room?._id);
      await this.roomService.remove(data.roomId);
      this.server.to(data.roomId).emit(ERoomEmits.ROOM_CLOSED);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Перезапуск комнаты (обнуление фильмов и жанров) */
  @SubscribeMessage(ERoomEvents.RELOAD_ROOM)
  async handleReloadRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    try {
      const room = await this.roomService.findOne(data.roomId);
      if (!room) return;

      room.genresSelections = {};
      room.movieSelections = {};
      room.movies = [];

      room.markModified('genresSelections');
      room.markModified('movieSelections');
      await room.save();

      this.server.to(data.roomId).emit(ERoomEmits.GENRES_LIST_UPDATED, []);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
