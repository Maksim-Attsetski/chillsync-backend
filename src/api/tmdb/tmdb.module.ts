import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TmdbService } from './tmdb.service';
import { TmdbController } from './tmdb.controller';
import { AuthModule } from '../auth';
import { MovieModule } from '../movies';
import { MovieReactionModule } from '../movie-reactions';

@Module({
  imports: [HttpModule, AuthModule, MovieModule, MovieReactionModule],
  providers: [TmdbService],
  controllers: [TmdbController],
})
export class TmdbModule {}
