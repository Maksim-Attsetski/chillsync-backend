import { UpdateMovieDto } from './update-movie.dto';

export class GetMovieDto extends UpdateMovieDto {
  _id: string;
  createdAt: number;

  constructor(model: GetMovieDto) {
    super();

    this.title = model?.title;
    this.adult = model?.adult;
    this.genre_ids = model?.genre_ids;
    this.id = model?.id;
    this.overview = model?.overview;
    this.poster_path = model?.poster_path;
    this.vote_average = model?.vote_average;
    this.vote_count = model?.vote_count;
    this._id = model?._id;
    this.createdAt = model?.createdAt;
  }
}
