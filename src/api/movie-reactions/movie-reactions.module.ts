import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth';
import { FriendModule } from '../friends';
import { MovieModule } from '../movies';
import { MovieReactionController } from './movie-reactions.controller';
import { MovieReaction, MovieReactionSchema } from './movie-reactions.entity';
import { MovieReactionService } from './movie-reactions.service';

export const MovieReactionModel = MongooseModule.forFeature([
  { name: MovieReaction?.name ?? 'MovieReaction', schema: MovieReactionSchema },
]);

@Module({
  imports: [
    MovieReactionModel,
    forwardRef(() => AuthModule),
    FriendModule,
    MovieModule,
  ],
  controllers: [MovieReactionController],
  providers: [MovieReactionService],
  exports: [MovieReactionModel, MovieReactionService],
})
export class MovieReactionModule {}
