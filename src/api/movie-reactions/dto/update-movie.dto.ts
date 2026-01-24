import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieReactionDto } from './create-movie-reaction.dto';

export class UpdateMovieReactionDto extends PartialType(
  CreateMovieReactionDto,
) {
  rating: number;
  viewed_at: Date | null;
}
