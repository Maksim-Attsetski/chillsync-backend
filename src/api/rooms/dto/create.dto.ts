import { TRoomMovie } from './get.dto';

export class CreateRoomDto {
  users: string[]; // userId[]
  creator_id: string | null;
  name: string;

  /** userId -> genreIds[]*/
  genres_selections: Record<string, number[]>;
  /** tmdb movie ids */
  movies: string[];
  /** userId -> movies with reaction */
  movie_selections: Record<string, TRoomMovie[]>;
}
