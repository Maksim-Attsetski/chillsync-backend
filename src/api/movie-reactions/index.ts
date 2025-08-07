import { MovieReactionService } from './movie-reactions.service';
import { MovieReactionController } from './movie-reactions.controller';
import { MovieReactionModule } from './movie-reactions.module';
import { CreateMovieReactionDto } from './dto/create-movie-reaction.dto';
import { UpdateMovieReactionDto } from './dto/update-movie.dto';
import { GetMovieReactionDto } from './dto/get-movie.dto';
export * from './movie-reactions.entity';

export {
  MovieReactionService,
  MovieReactionController,
  MovieReactionModule,
  // dto
  CreateMovieReactionDto,
  UpdateMovieReactionDto,
  GetMovieReactionDto,
};
