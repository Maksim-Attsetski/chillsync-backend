import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MovieService } from 'src/api';
import { TmdbService } from 'src/api/tmdb/tmdb.service';
import { IMovie } from 'src/api/tmdb/types';
import { IArrayRes } from 'src/utils/mongoUtils';
import crypto from 'crypto';

type TMovieWithReaction = IMovie & { reaction: string };

interface RoomData {
  users: string[]; // массив userId
  creator_id: string;
  genresSelections: Record<string, number[]>; // userId → genreIds
  movies: IMovie[];
  movieSelections: Record<string, TMovieWithReaction[]>;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'rooms' })
export class RoomsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms: Record<string, RoomData> = {};
  private clients: Record<string, string> = {}; // client.id → userId

  constructor(
    private readonly moviesService: MovieService,
    private readonly tmdbService: TmdbService,
  ) {}

  handleConnection(client: Socket) {
    console.log('✅ Клиент подключился:', client.id);
  }

  /** Создать комнату */
  @SubscribeMessage('create_room')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const roomId = crypto.randomUUID();
    this.clients[client.id] = data.userId;

    this.rooms[roomId] = {
      creator_id: data.userId,
      users: [data.userId],
      genresSelections: {},
      movies: [],
      movieSelections: {},
    };

    client.join(roomId);
    return { event: 'room_created', data: { roomId, creator_id: data.userId } };
  }

  /** Присоединиться к комнате */
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    const room = this.rooms[data.roomId];
    if (!room) return { event: 'error', data: 'Room not found' };

    if (!room.users.includes(data.userId)) room.users.push(data.userId);
    this.clients[client.id] = data.userId;
    client.join(data.roomId);

    this.server
      .to(data.roomId)
      .emit('joined_room', {
        roomId: data.roomId,
        userId: data.userId,
        users: room.users,
      });
    return {
      event: 'joined_room',
      data: { roomId: data.roomId, userId: data.userId },
    };
  }

  /** Начать событие → рассылаем жанры */
  @SubscribeMessage('event_start')
  async handleEventStart(@MessageBody() data: { roomId: string }) {
    const room = this.rooms[data.roomId];
    if (!room) return;

    const genres = await this.tmdbService.getGenres();
    this.server.to(data.roomId).emit('genres_list', genres.genres);
  }

  /** Клиенты выбрали жанры */
  @SubscribeMessage('event_genres_selected')
  async handleGenresSelected(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; genreIds: number[]; userId: string },
  ) {
    const room = this.rooms[data.roomId];
    if (!room) return;

    room.genresSelections[data.userId] = data.genreIds;

    const allSelected = room.users.every((u) => room.genresSelections[u]);
    if (!allSelected) return;

    const res = (await this.moviesService.findMoviesForUserList(
      room.users,
      Object.values(room.genresSelections).flat().join(','),
    )) as IArrayRes;

    room.movies = res.data;
    this.server.to(data.roomId).emit('movies_list', room.movies);
  }

  /** Юзер выбрал фильмы */
  @SubscribeMessage('event_movies_selected')
  handleMoviesSelected(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { roomId: string; movies: TMovieWithReaction[]; userId: string },
  ) {
    const room = this.rooms[data.roomId];
    if (!room) return;

    room.movieSelections[data.userId] = data.movies;

    const allSelected = room.users.every((u) => room.movieSelections[u]);
    if (!allSelected) return;

    const movieVotes: Record<number, { movie: any; likes: number }> = {};
    for (const userId of room.users) {
      const selections = room.movieSelections[userId];
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

    this.server.to(data.roomId).emit('event_results', winners);
  }

  /** Выход пользователя / закрытие комнаты */
  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = this.rooms[data.roomId];
    const userId = this.clients[client.id];
    if (!room || !userId) return;

    room.users = room.users.filter((u) => u !== userId);
    delete room.genresSelections[userId];
    delete room.movieSelections[userId];
    delete this.clients[client.id];

    this.server.to(data.roomId).emit('user_left', { userId });

    if (room.users.length === 0) {
      delete this.rooms[data.roomId];
    }
  }

  /** Закрыть комнату */
  @SubscribeMessage('close_room')
  handleCloseRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = this.rooms[data.roomId];
    if (!room) return;

    for (const userId of room.users) {
      const clientId = Object.entries(this.clients).find(
        ([cid, uid]) => uid === userId,
      )?.[0];
      if (clientId) delete this.clients[clientId];
    }

    this.server.to(data.roomId).emit('room_closed');
    delete this.rooms[data.roomId];
  }

  /** Перезапуск комнаты (обнуление фильмов и жанров) */
  @SubscribeMessage('reload_room')
  handleReloadRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = this.rooms[data.roomId];
    if (!room) return;

    room.genresSelections = {};
    room.movies = [];
    room.movieSelections = {};

    this.server.to(data.roomId).emit('genres_list', []); // или можно заново запросить жанры
  }

  handleDisconnect(client: Socket) {
    const userId = this.clients[client.id];
    delete this.clients[client.id];
    if (!userId) return;

    for (const [roomId, room] of Object.entries(this.rooms)) {
      if (room.users.includes(userId)) {
        room.users = room.users.filter((u) => u !== userId);
        delete room.genresSelections[userId];
        delete room.movieSelections[userId];

        this.server.to(roomId).emit('user_left', { userId });

        if (room.users.length === 0) {
          delete this.rooms[roomId];
        }
      }
    }
  }
}
