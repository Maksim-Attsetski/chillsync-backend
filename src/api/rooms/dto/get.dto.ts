import { IMovie } from 'src/api/tmdb/types';
import { IBase } from 'src/types';

export type TRoomMovie = IMovie & {
  reaction: 'LIKE' | 'DISLIKE';
};

export class GetRoomDto implements IBase {
  _id: string;
  created_at: number;
  updated_at: number;

  creator_id: string | null;
  users: string[];

  /**
   * userId -> genreIds[]
   */
  genresSelections: Record<string, number[]>;

  /**
   * userId -> selected movies
   */
  movieSelections: Record<string, TRoomMovie[]>;

  /**
   * tmdb movie ids
   */
  movies: string[];
}
