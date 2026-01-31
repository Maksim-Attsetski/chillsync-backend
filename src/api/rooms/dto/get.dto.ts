import { IMovie } from 'src/api/tmdb/types';
import { IBase } from 'src/types';

export type TRoomMovie = IMovie & {
  reaction: 'LIKE' | 'DISLIKE';
};

export class GetRoomDto implements IBase {
  _id: string;
  updated_at: Date | null;
  created_at: Date;

  activated_at: string | null;
  name: string;
  creator_id: string | null;
  users: string[];

  /**
   * userId -> genreIds[]
   */
  genres_selections: Record<string, number[]>;

  /**
   * userId -> selected movies
   */
  movie_selections: Record<string, TRoomMovie[]>;

  /**
   * tmdb movie ids
   */
  movies: string[];
}
