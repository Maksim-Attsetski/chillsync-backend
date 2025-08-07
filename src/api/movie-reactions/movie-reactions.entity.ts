import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Users } from '../users';
import { Movie } from '../movies';

export type MovieReactionDocument = HydratedDocument<MovieReaction>;

@Schema()
export class MovieReaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Movie', default: null })
  movie_id: Movie;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null })
  user_id: Users;

  @Prop({ required: true })
  reaction: string;

  @Prop()
  createdAt: number;
}

export const MovieReactionSchema = SchemaFactory.createForClass(MovieReaction);
