import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Base } from 'src/types';

import { Movie } from '../movies';
import { Users } from '../users';

export type MovieReactionDocument = HydratedDocument<MovieReaction>;

@Schema()
export class MovieReaction extends Base {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    default: null,
  })
  movie_id: Movie;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    default: null,
  })
  user_id: Users;

  @Prop({ required: true })
  reaction: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ type: Date, default: null })
  viewed_at: Date | null;
}

export const MovieReactionSchema = SchemaFactory.createForClass(MovieReaction);
