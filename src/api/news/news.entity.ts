import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type newsDocument = HydratedDocument<News>;

@Schema()
export class News {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  preview: string;

  @Prop()
  tag: string[];

  @Prop()
  createdAt: number;
}

export const NewsSchema = SchemaFactory.createForClass(News);
