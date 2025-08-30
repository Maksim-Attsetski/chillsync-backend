import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Users } from 'src/api';

export type SessionDocument = HydratedDocument<Session>;

@Schema()
export class Session {
  @Prop({ required: true }) refreshToken: string; // hash(plainRefresh)

  @Prop() device_name?: string;

  @Prop() user_agent?: string;

  @Prop() ip?: string;

  @Prop({ default: Date.now }) created_at: Date;

  @Prop({ default: Date.now }) last_active_at: Date;

  @Prop({ type: Date, index: true }) expire_at?: Date;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'Users' })
  user_id: Users;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
