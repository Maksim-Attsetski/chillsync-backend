import { Base } from 'src/types';

import { UpdateSettingDto } from './update.dto';

type TDto = UpdateSettingDto & Base;

export class GetSettingDto implements TDto {
  _id: string;
  updated_at: Date | null;
  created_at: Date;
  user_id: string;
  is_guide_completed: boolean;
  theme: string;
  stat_visability: string;
}
