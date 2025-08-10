import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TmdbService } from './tmdb.service';
import { TmdbController } from './tmdb.controller';

@Module({
  imports: [HttpModule],
  providers: [TmdbService],
  controllers: [TmdbController],
})
export class TmdbModule {}
