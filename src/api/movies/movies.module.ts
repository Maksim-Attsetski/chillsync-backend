import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth';
import { MovieController } from './movies.controller';
import { Movie, MovieSchema } from './movies.entity';
import { MovieService } from './movies.service';

export const MovieModel = MongooseModule.forFeature([
  { name: Movie.name, schema: MovieSchema },
]);

@Module({
  imports: [MovieModel, forwardRef(() => AuthModule)],
  controllers: [MovieController],
  providers: [MovieService],
  exports: [MovieModel, MovieService],
})
export class MovieModule {}
