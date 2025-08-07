import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { MovieService } from './movies.service';
import { MovieController } from './movies.controller';
import { Movie, MovieSchema } from './movies.entity';
import { AuthModule } from '../auth';
import { MovieReactionService } from '../movie-reactions';
import { MovieReactionModel } from '../movie-reactions/movie-reactions.module';
import { JwtService } from '@nestjs/jwt';

export const MovieModel = MongooseModule.forFeature([
  { name: Movie.name, schema: MovieSchema },
]);

@Module({
  imports: [MovieModel, AuthModule, MovieReactionModel],
  controllers: [MovieController],
  providers: [MovieService, MovieReactionService, JwtService],
  exports: [MovieModel, MovieService],
})
export class MovieModule {}
