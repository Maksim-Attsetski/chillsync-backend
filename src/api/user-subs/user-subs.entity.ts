import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Users } from '../users';
import { Subscription } from '../subscriptions';

export type userSubDocument = HydratedDocument<UserSubscription>;

@Schema()
export class UserSubscription {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null,
  })
  subId: Subscription;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    default: null,
    unique: true,
  })
  userId: Users;

  @Prop({ required: true })
  expitedAt: number;

  @Prop()
  createdAt: number;
}

export const UserSubSchema = SchemaFactory.createForClass(UserSubscription);
