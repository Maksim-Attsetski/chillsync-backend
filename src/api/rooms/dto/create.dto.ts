import { TRoomMovie } from './get.dto';

export class CreateRoomDto {
  users: string[]; // userId[]
  creator_id: string | null;

  /**
   * userId -> genreIds[]
   */
  genresSelections: Record<string, number[]>;

  /**
   * tmdb movie ids
   */
  movies: string[];

  /**
   * userId -> movies with reaction
   */
  movieSelections: Record<string, TRoomMovie[]>;
}
