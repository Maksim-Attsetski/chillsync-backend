import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Base } from 'src/types';

export type subscriptionDocument = HydratedDocument<Subscription>;

@Schema()
export class Subscription extends Base {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  description: string;

  @Prop({ required: true, unique: true })
  price: number;

  @Prop()
  discount: number;

  @Prop({ required: true, unique: true })
  live_time: number;

  @Prop({ required: true, default: [] })
  points: {
    title: string;
    description: string;
    icon: string;
  }[];
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
