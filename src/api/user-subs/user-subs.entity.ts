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
  sub_id: Subscription;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    default: null,
    unique: true,
  })
  user_id: Users;

  // реальное поле Date для TTL
  @Prop({ type: Date, required: true, index: { expireAfterSeconds: 0 } })
  expired_at: Date;
}

export const UserSubSchema = SchemaFactory.createForClass(UserSubscription);
