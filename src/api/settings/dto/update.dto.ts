import { CreateSettingDto } from './create.dto';

export class UpdateSettingDto extends CreateSettingDto {
  theme: string;
  is_guide_completed: boolean;
  stat_visability: string;
}
