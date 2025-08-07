import { MovieService } from './movies.service';
import { MovieController } from './movies.controller';
import { MovieModule } from './movies.module';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { GetMovieDto } from './dto/get-movie.dto';
export * from './movies.entity';

export {
  MovieService,
  MovieController,
  MovieModule,
  // dto
  CreateMovieDto,
  UpdateMovieDto,
  GetMovieDto,
};
