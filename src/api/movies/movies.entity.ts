import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MovieDocument = HydratedDocument<Movie>;

@Schema()
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  adult: false;

  @Prop({ required: true })
  genre_ids: number[];

  @Prop({ required: true })
  poster_path: string;

  @Prop({ required: true })
  overview: string;

  @Prop({ required: true })
  vote_average: number;

  @Prop({ required: true })
  vote_count: number;

  @Prop()
  created_at: number;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
