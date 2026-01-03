import { Base } from 'src/types';

import { UpdateMovieReactionDto } from './update-movie.dto';

type TDto = UpdateMovieReactionDto & Base;

export class GetMovieReactionDto implements TDto {
  rating: number;
  viewed_at: number | null;
  movie_id?: string;
  user_id?: string;
  reaction?: string;
  updated_at: number;
  _id: string;
  created_at: number;
}
