import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Base {
  @Prop()
  createdAt: number;

  @Prop({ default: null })
  updatedAt: number;
}

export interface IBase {
  updatedAt: number | null;
  createdAt: number;
  _id: string;
}
