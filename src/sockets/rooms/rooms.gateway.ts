import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';
import { MovieService } from 'src/api';
import { IMovie } from 'src/api/tmdb/types';

type TMovieWthReaction = IMovie & { reaction: string };
interface RoomData {
  users: string[]; // socket.id[]
  movies: IMovie[];
  selections: Record<string, TMovieWthReaction[]>;
  admin: string;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'rooms',
})
export class RoomsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly moviesService: MovieService) {}

  // in-memory комнаты
  private rooms: Record<string, RoomData> = {};

  handleConnection(client: Socket) {
    console.log('✅ Клиент подключился:', client.id);
  }

  /** Создать комнату */
  @SubscribeMessage('create_room')
  async handleCreateRoom(@ConnectedSocket() client: Socket) {
    const roomId = randomUUID();
    const movies = await this.generateMovies();
    this.rooms[roomId] = {
      users: [client.id],
      movies,
      selections: {},
      admin: client.id,
    };

    client.join(roomId);
    return { event: 'room_created', data: { roomId } };
  }

  /** Подключение к комнате */
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = this.rooms[data.roomId];
    if (!room) {
      return { event: 'error', data: 'Room not found' };
    }

    room.users.push(client.id);
    client.join(data.roomId);

    return { event: 'joined_room', data: { roomId: data.roomId } };
  }

  /** Начать событие */
  @SubscribeMessage('event_start')
  handleEventStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = this.rooms[data.roomId];
    if (!room) return;

    // отправляем всем фильмы
    this.server.to(data.roomId).emit('movies_list', room.movies);
  }

  /** Юзер выбрал фильмы */
  @SubscribeMessage('event_movies_selected')
  handleMoviesSelected(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      movies: TMovieWthReaction[];
    },
  ) {
    const room = this.rooms[data.roomId];
    if (!room) return;

    // сохраняем выбор этого юзера
    room.selections[client.id] = data.movies;

    // Проверяем — все ли пользователи сделали выбор
    const allSelected = room.users.every((userId) => room.selections[userId]);
    if (!allSelected) return;

    // Считаем количество голосов
    const movieVotes: Record<number, { movie: any; likes: number }> = {};

    for (const userId of room.users) {
      const selections = room.selections[userId];
      for (const sel of selections) {
        if (sel.reaction === 'LIKE') {
          if (!movieVotes[sel.id]) {
            movieVotes[sel.id] = { movie: sel, likes: 0 };
          }
          movieVotes[sel.id].likes += 1;
        }
      }
    }

    // Находим фильмы, у которых >= 80% голосов
    const needed = Math.ceil(room.users.length * 0.8);
    const winners = Object.values(movieVotes)
      .filter((m) => m.likes >= needed)
      .map((m) => m.movie);

    // Рассылаем всем результат
    this.server.to(data.roomId).emit('event_results', winners);
  }

  /** Закрыть комнату (админ) */
  @SubscribeMessage('close_room')
  handleCloseRoom(@MessageBody() data: { roomId: string }) {
    const room = this.rooms[data.roomId];
    if (!room) return;

    this.server.to(data.roomId).emit('room_closed');
    for (const userId of room.users) {
      const client = this.server.sockets.sockets.get(userId);
      client?.leave(data.roomId);
    }
    delete this.rooms[data.roomId];
  }

  /** Покинуть комнату */
  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const room = this.rooms[data.roomId];
    if (!room) return;

    room.users = room.users.filter((u) => u !== client.id);
    client.leave(data.roomId);

    if (room.users.length === 0) {
      delete this.rooms[data.roomId];
    } else {
      this.server.to(data.roomId).emit('user_left', { userId: client.id });
    }
  }

  /** Reload (новый список фильмов, сброс выборов) */
  @SubscribeMessage('reload_room')
  async handleReloadRoom(@MessageBody() data: { roomId: string }) {
    const room = this.rooms[data.roomId];
    if (!room) return;

    room.movies = await this.generateMovies();
    room.selections = {};
    this.server.to(data.roomId).emit('movies_list', room.movies);
  }

  /** Автосброс комнаты, если клиент отключился */
  handleDisconnect(client: Socket) {
    console.log('❌ Клиент отключился:', client.id);
    for (const [roomId, room] of Object.entries(this.rooms)) {
      if (room.users.includes(client.id)) {
        room.users = room.users.filter((u) => u !== client.id);
        if (room.users.length === 0) {
          delete this.rooms[roomId];
        } else {
          this.server.to(roomId).emit('user_left', { userId: client.id });
        }
      }
    }
  }

  /** Вспомогательная генерация фильмов */
  async generateMovies() {
    const movies = await this.moviesService.findAll({
      limit: 30,
      filter: 'vote_count>=50',
      sort: 'vote_average==desc',
    });
    return movies.data;
  }
}
