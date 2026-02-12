
import { UpdateMovieReactionDto } from './update-movie.dto';

type TDto = UpdateMovieReactionDto & {
  updated_at: Date | null;
  created_at: Date | null;
};

export class GetMovieReactionDto implements TDto {
  rating: number;
  viewed_at: Date | null;
  movie_id?: string;
  user_id?: string;
  reaction?: string;
  _id: string;
  updated_at: Date | null;
  created_at: Date | null;
}
