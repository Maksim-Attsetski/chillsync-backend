import { Module } from '@nestjs/common';

import { AuthModule } from '../auth';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { MovieReactionModule } from '../movie-reactions';
import { FriendModule } from '../friends';

@Module({
  imports: [AuthModule, MovieReactionModule, FriendModule],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
