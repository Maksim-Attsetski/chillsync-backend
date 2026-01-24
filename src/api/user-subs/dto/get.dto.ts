import { IBase } from 'src/types';
import { UpdateUserSubDto } from './update.dto';

type TDto = UpdateUserSubDto & IBase;

export class GetUserSubDto implements TDto {
  sub_id?: string | undefined;
  user_id?: string | undefined;
  _id: string;
  updated_at: Date | null;
  created_at: Date;
  expired_at?: Date;
}
