import { Base } from 'src/types';
import { UpdateMovieDto } from './update-movie.dto';

type TDto = UpdateMovieDto & Base & { reaction: string };

export class GetMovieDto implements TDto {
  id?: number;
  adult?: false;
  genre_ids?: number[];
  poster_path?: string;
  title?: string;
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  reaction: string;
  release_date?: string;
  _id: string;
  updated_at: Date | null;
  created_at: Date;
}
