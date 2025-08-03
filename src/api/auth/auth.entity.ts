import { HydratedDocument, Schema as MSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Users } from 'src/api';

export type TokenDocument = HydratedDocument<Token>;

@Schema()
export class Token {
  @Prop()
  refreshToken: string;

  @Prop({ type: MSchema.Types.ObjectId, ref: 'Users' })
  userID: Users;

  @Prop({ default: '' })
  userAgent: string;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
