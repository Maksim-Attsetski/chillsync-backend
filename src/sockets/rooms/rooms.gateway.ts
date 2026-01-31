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
import { CreateMovieDto, GetUserDto, MovieReactionService } from 'src/api';
import { RoomStoreService, TRoomMovie } from 'src/api/rooms';
import { TmdbService } from 'src/api/tmdb/tmdb.service';
import { ERoomEmits, ERoomEvents } from 'src/types';

interface ICreateRoomDto {
  user_id: string;
  user: GetUserDto;
  name?: string;
}
interface IJoinRoomDto extends ICreateRoomDto {
  room_id: string;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'rooms' })
@Injectable({ scope: Scope.DEFAULT })
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Record<string, Socket> = {}; // user_id -> client.id
  private users: Record<string, GetUserDto> = {}; // user_id -> user

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

    const user_id = client.handshake.auth?.user_id;
    const user: GetUserDto = client.handshake.auth?.user;
    const room_id = client.handshake.auth?.room_id;
    const room_name = client.handshake.auth?.room_name;

    if (user_id) {
      this.clients[user_id] = client;
      if (user?._id) {
        this.users[user_id] = user;
      }

      try {
        if (room_id) {
          const room = await this.roomService.findOne(room_id);
          if (room && !room?.users?.includes(user_id)) {
            await this.handleJoinRoom(client, {
              room_id,
              user_id,
              user,
              name: room_name,
            });
          } else {
            await client.join(room_id);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  handleDisconnect(client: Socket) {
    const user_id = client.handshake.auth?.user_id;
    if (user_id) {
      delete this.clients[user_id];
      console.log('❌ Клиент отключился:', client.id, user_id);
    }

    void this.removeUserFromRooms(user_id, client.handshake.auth?.room_id);
  }

  private async removeUserFromRooms(user_id: string, room_id?: string) {
    const rooms = await this.roomService.findByUser(user_id);

    const curRooms = room_id
      ? rooms?.data?.filter((r) => r._id?.toString() === room_id)
      : rooms.data;

    for (const room of curRooms) {
      room.users = room.users.filter((u) => u !== user_id);
      delete room.genres_selections[user_id];
      delete room.movie_selections[user_id];

      room.markModified('genres_selections');
      room.markModified('movie_selections');
      await room.save();

      this.server
        .to(String(room._id))
        .emit(ERoomEmits.USER_LEFT, { user_id, room_id });
    }
  }

  /** Получить комнату пользователя */
  // @SubscribeMessage('get_room')
  // async handleGetRoom(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: { user_id: string },
  // ) {
  //   const rooms = await this.roomService.findByUser(data.user_id);
  //   const room = rooms?.data?.at?.(0);

  //   return { event: 'room_received', data: room };
  // }

  /** Создать комнату */
  @SubscribeMessage(ERoomEvents.CREATE_ROOM)
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ICreateRoomDto,
  ) {
    if (!data?.name) return;

    if (data?.user?._id) {
      this.users[data?.user?._id] = data?.user;
    }

    try {
      const response = await this.roomService.create({
        creator_id: data.user_id,
        users: [data.user_id],
        movies: [],
        genres_selections: {},
        movie_selections: {},
        name: data.name,
      });

      console.log(response);

      await client.join(String(response._id));

      return {
        event: ERoomEmits.ROOM_CREATED,
        data: { room: response, user: data?.user },
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Присоединиться к комнате */
  @SubscribeMessage(ERoomEvents.JOIN_ROOM)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: IJoinRoomDto,
  ) {
    try {
      if (data?.user?._id) {
        this.users[data?.user?._id] = data?.user;
      }
      const room = await this.roomService.findOne(data.room_id);
      if (!room) return this.handleCreateRoom(client, data);

      if (!room.users.includes(data.user_id)) {
        room.users.push(data.user_id);
        await this.roomService.update(String(room._id), { users: room.users });
      }

      await client.join(data.room_id);

      const joined_users: GetUserDto[] = [];

      room.users.forEach((u) => {
        const user = this.users[u];
        if (user) {
          joined_users.push(user);
        }
      });

      this.server.to(data.room_id).emit(ERoomEmits.ROOM_REPLENISHED, {
        room_id: data.room_id,
        user_id: data.user_id,
        users: room.users,
        joined_users,
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Начать событие → рассылаем жанры */
  @SubscribeMessage(ERoomEvents.START_EVENT)
  async handleEventStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    try {
      const room = await this.roomService.findOne(data.room_id);
      if (!room) return;

      const sockets = await this.server.in(data.room_id).fetchSockets();
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
        .to(data.room_id)
        .emit(ERoomEmits.GENRES_LIST_UPDATED, genres.genres);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Клиенты выбрали жанры */
  @SubscribeMessage(ERoomEvents.GENRES_SELECTED)
  async handleGenresSelected(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { room_id: string; genreIds: number[]; user_id: string },
  ) {
    try {
      const room = await this.roomService.findOne(data.room_id);
      if (!room) return;

      room.genres_selections[data.user_id] = data.genreIds;
      room.markModified('genres_selections');
      await room.save();

      const allSelected = room.users.every((u) => room.genres_selections[u]);
      if (!allSelected) return;

      const res = await this.moviesReactionService.findMoviesForUserList(
        room.users,
        Array.from(Object.values(room.genres_selections)).flat().join(','),
      );

      room.movies = res?.data?.map((m) => String(m.id));
      await room.save();

      this.server
        .to(data.room_id)
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
    data: { room_id: string; movies: TRoomMovie[]; user_id: string },
  ) {
    try {
      const room = await this.roomService.findOne(data.room_id);
      if (!room) return;

      room.movie_selections[data.user_id] = data.movies;
      room.markModified('movie_selections');
      await room.save();

      const allSelected = room.users.every((u) => room.movie_selections[u]);
      if (!allSelected) return;

      const movieVotes: Record<number, { movie: TRoomMovie; likes: number }> =
        {};
      for (const user_id of room.users) {
        const selections = room.movie_selections[user_id] ?? [];
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
            room.movie_selections[id] as CreateMovieDto[],
            id,
          ),
        ),
      );

      this.server.to(data.room_id).emit(ERoomEmits.EVENT_RESULTS, winners);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Выход пользователя / закрытие комнаты */
  @SubscribeMessage(ERoomEvents.LEAVE_ROOM)
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    try {
      const user_id = client.handshake.auth?.user_id;
      if (!user_id) return this.handleError('Вы не авторизованы');
      delete this.clients[user_id];

      const room = await this.roomService.findOne(data.room_id);
      if (!room) return;

      room.users = room.users.filter((u) => u !== user_id);
      delete room.genres_selections[user_id];
      delete room.movie_selections[user_id];
      room.markModified('genres_selections');
      room.markModified('movie_selections');

      await room.save();

      this.server.to(data.room_id).emit(ERoomEmits.USER_LEFT, { user_id });
      this.server.in(data.room_id).socketsLeave(data.room_id);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Закрыть комнату */
  @SubscribeMessage(ERoomEvents.CLOSE_ROOM)
  async handleCloseRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    try {
      const room = await this.roomService.findOne(data.room_id);
      if (!room) return;

      for (const user_id of room.users) {
        if (user_id) delete this.clients[user_id];
      }

      console.log('❌ Клиент закрыл комнату:', room?._id);
      await this.roomService.remove(data.room_id);
      this.server.to(data.room_id).emit(ERoomEmits.ROOM_CLOSED);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /** Перезапуск комнаты (обнуление фильмов и жанров) */
  @SubscribeMessage(ERoomEvents.RELOAD_ROOM)
  async handleReloadRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room_id: string },
  ) {
    try {
      const room = await this.roomService.findOne(data.room_id);
      if (!room) return;

      room.genres_selections = {};
      room.movie_selections = {};
      room.movies = [];

      room.markModified('genres_selections');
      room.markModified('movie_selections');
      await room.save();

      this.server.to(data.room_id).emit(ERoomEmits.GENRES_LIST_UPDATED, []);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
