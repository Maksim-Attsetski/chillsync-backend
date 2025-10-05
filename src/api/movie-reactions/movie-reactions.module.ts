import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { MovieReactionService } from './movie-reactions.service';
import { MovieReactionController } from './movie-reactions.controller';
import { MovieReaction, MovieReactionSchema } from './movie-reactions.entity';
import { FriendModule } from '../friends';
import { AuthModule } from '../auth';
import { MovieModule } from '../movies';

export const MovieReactionModel = MongooseModule.forFeature([
  { name: MovieReaction?.name ?? 'MovieReaction', schema: MovieReactionSchema },
]);

@Module({
  imports: [MovieReactionModel, AuthModule, FriendModule, MovieModule],
  controllers: [MovieReactionController],
  providers: [MovieReactionService],
  exports: [MovieReactionModel, MovieReactionService],
})
export class MovieReactionModule {}
