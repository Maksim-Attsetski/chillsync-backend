import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { MovieService } from './movies.service';
import { MovieController } from './movies.controller';
import { Movie, MovieSchema } from './movies.entity';
import { MovieReactionModule } from '../movie-reactions';
import { AuthModule } from '../auth';

export const MovieModel = MongooseModule.forFeature([
  { name: Movie.name, schema: MovieSchema },
]);

@Module({
  imports: [MovieModel, forwardRef(() => MovieReactionModule), AuthModule],
  controllers: [MovieController],
  providers: [MovieService],
  exports: [MovieModel, MovieService],
})
export class MovieModule {}
