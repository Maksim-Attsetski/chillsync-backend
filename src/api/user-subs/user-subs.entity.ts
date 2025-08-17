import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Users } from '../users';
import { Subscription } from '../subscriptions';
import { Base } from 'src/types';

export type userSubDocument = HydratedDocument<UserSubscription>;

@Schema()
export class UserSubscription extends Base {
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
}

export const UserSubSchema = SchemaFactory.createForClass(UserSubscription);
