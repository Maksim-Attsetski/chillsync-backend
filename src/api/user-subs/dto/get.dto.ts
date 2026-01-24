import { IBase } from 'src/types';
import { UpdateUserSubDto } from './update.dto';

type TDto = UpdateUserSubDto & IBase;

export class GetUserSubDto implements TDto {
  _id: string;
  created_at: number;
  sub_id?: string | undefined;
  user_id?: string | undefined;
  expired_at?: number | undefined;
  updated_at: number;
}
