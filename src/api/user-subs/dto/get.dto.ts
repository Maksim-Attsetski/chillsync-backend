import { IBase } from 'src/types';
import { UpdateUserSubDto } from './update.dto';

type TDto = UpdateUserSubDto & IBase;

export class GetUserSubDto implements TDto {
  _id: string;
  createdAt: number;
  subId?: string | undefined;
  userId?: string | undefined;
  expitedAt?: number | undefined;
  updatedAt: number;
}
