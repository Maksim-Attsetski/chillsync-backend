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

  @Prop({ required: true })
  expired_at: number;

  // реальное поле Date для TTL
  @Prop({ type: Date, index: { expireAfterSeconds: 0 } })
  expireAtDate: Date;
}

export const UserSubSchema = SchemaFactory.createForClass(UserSubscription);

// перед сохранением синхронизируем Date с ms
UserSubSchema.pre('save', function (next) {
  if (this.expired_at) {
    this.expireAtDate = new Date(this.expired_at);
  } else {
    // защита от случайностей — далеко в будущее
    this.expireAtDate = new Date(new Date().getFullYear() + 10 + '-01-01');
  }
  next();
});
