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
  updatedAt: number;
  reaction: string;
  _id: string;
  createdAt: number;
}
