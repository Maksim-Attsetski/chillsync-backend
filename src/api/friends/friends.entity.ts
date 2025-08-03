import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Users } from '../users';

export type FriendDocument = HydratedDocument<Friend>;

@Schema()
export class Friend {
  @Prop({
    type: [mongoose.Schema.Types.ObjectId, mongoose.Schema.Types.ObjectId],
    ref: 'Users',
  })
  user_ids: [Users, Users];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null })
  waiter: Users;

  @Prop({ default: '' })
  message: string;

  @Prop()
  createdAt: number;
}

export const FriendSchema = SchemaFactory.createForClass(Friend);
