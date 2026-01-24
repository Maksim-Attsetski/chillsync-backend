import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Base {
  @Prop({ type: Date })
  created_at: Date;

  @Prop({ type: Date, default: null })
  updated_at: Date | null;
}

export interface IBase {
  updated_at: Date | null;
  created_at: Date;
  _id: string;
}
