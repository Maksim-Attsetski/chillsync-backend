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
  updatedAt: number;
  _id: string;
  createdAt: number;
}
