import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ERoles } from './dto/create-user.dto';
import { Base } from 'src/types';

export type UsersDocument = HydratedDocument<Users>;

@Schema()
export class Users extends Base {
  @Prop({ required: true, unique: true })
  public_id: string;

  @Prop({ required: true })
  first_name: string;

  @Prop({ default: 'Пусто' })
  last_name: string;

  @Prop()
  password: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: ERoles.USER })
  role: string;

  @Prop({ default: null })
  location: string;

  @Prop({ default: 'male' })
  sex: 'male' | 'female';

  @Prop({ default: null })
  avatar: string;

  @Prop({ default: null })
  blockedAt: number;

  @Prop({ default: ['pass'] })
  providers: ['pass' | 'google'];
}

export const UsersSchema = SchemaFactory.createForClass(Users);
