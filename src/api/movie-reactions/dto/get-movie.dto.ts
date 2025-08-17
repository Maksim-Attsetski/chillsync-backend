import { Base } from 'src/types';
import { UpdateMovieReactionDto } from './update-movie.dto';

type TDto = UpdateMovieReactionDto & Base;

export class GetMovieReactionDto implements TDto {
  movie_id?: string;
  user_id?: string;
  reaction?: string;
  updatedAt: number;
  _id: string;
  createdAt: number;
}
