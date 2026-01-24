import { IBase } from 'src/types';

import { UpdateSubDto } from './update-sub.dto';

type TDto = UpdateSubDto & IBase;

export class GetSubDto implements TDto {
  description?: string;
  name?: string;
  price?: number;
  discount?: number;
  live_time?: number;
  points?: any[];
  _id: string;
  updated_at: Date | null;
  created_at: Date;
}
