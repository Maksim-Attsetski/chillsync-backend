import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { MovieReactionService } from './movie-reactions.service';
import { MovieReactionController } from './movie-reactions.controller';
import { MovieReaction, MovieReactionSchema } from './movie-reactions.entity';
import { AuthModule } from '../auth';

export const MovieReactionModel = MongooseModule.forFeature([
  { name: MovieReaction.name, schema: MovieReactionSchema },
]);

@Module({
  imports: [MovieReactionModel, AuthModule],
  controllers: [MovieReactionController],
  providers: [MovieReactionService],
  exports: [MovieReactionModel, MovieReactionService],
})
export class MovieReactionModule {}
