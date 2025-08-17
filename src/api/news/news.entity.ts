import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Base } from 'src/types';

export type newsDocument = HydratedDocument<News>;

@Schema()
export class News extends Base {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop()
  preview: string;

  @Prop()
  tag: string[];
}

export const NewsSchema = SchemaFactory.createForClass(News);
