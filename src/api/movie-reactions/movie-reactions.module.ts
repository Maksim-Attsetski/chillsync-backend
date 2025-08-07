import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { MovieReactionService } from './movie-reactions.service';
import { MovieReactionController } from './movie-reactions.controller';
import { MovieReaction, MovieReactionSchema } from './movie-reactions.entity';
import { UsersModule } from '../users';

export const MovieReactionModel = MongooseModule.forFeature([
  { name: MovieReaction?.name ?? 'MovieReaction', schema: MovieReactionSchema },
]);

@Module({
  imports: [MovieReactionModel, forwardRef(() => UsersModule)],
  controllers: [MovieReactionController],
  providers: [MovieReactionService],
  exports: [MovieReactionModel, MovieReactionService],
})
export class MovieReactionModule {}
