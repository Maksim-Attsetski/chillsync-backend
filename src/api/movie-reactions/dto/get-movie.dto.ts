import { UpdateMovieReactionDto } from './update-movie.dto';

export class GetMovieReactionDto extends UpdateMovieReactionDto {
  _id: string;
  createdAt: number;

  constructor(model: GetMovieReactionDto) {
    super();

    this.movie_id = model?.movie_id;
    this.reaction = model?.reaction;
    this.user_id = model?.user_id;
    this._id = model?._id;
    this.createdAt = model?.createdAt;
  }
}
