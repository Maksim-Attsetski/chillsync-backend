import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Base {
  @Prop()
  created_at: number;

  @Prop({ default: null })
  updated_at: number;
}

export interface IBase {
  updated_at: number | null;
  created_at: number;
  _id: string;
}
