import { IBase } from 'src/types';
import { UpdateUserSubDto } from './update.dto';

type TDto = UpdateUserSubDto & IBase;

export class GetUserSubDto implements TDto {
  _id: string;
  created_at: number;
  subId?: string | undefined;
  userId?: string | undefined;
  expitedAt?: number | undefined;
  updated_at: number;
}
