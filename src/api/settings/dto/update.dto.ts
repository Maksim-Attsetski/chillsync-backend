import { CreateSettingDto } from './create.dto';

export class UpdateSettingDto extends CreateSettingDto {
  theme: string;
  statVisability: string;
}
