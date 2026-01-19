import { Base } from 'src/types';

import { UpdateSettingDto } from './update.dto';

type TDto = UpdateSettingDto & Base;

export class GetSettingDto implements TDto {
  updated_at: number;
  _id: string;
  created_at: number;
  user_id: string;
  theme: string;
  statVisability: string;
}
