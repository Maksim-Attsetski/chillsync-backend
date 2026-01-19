import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Base } from 'src/types';

import { Users } from '../users';

export type SettingDocument = HydratedDocument<Setting>;

@Schema()
export class Setting extends Base {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    default: null,
  })
  user_id: Users;

  @Prop({ default: 'SYSTEM' })
  theme: string;

  @Prop({ default: 'ALL' })
  statVisability: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
