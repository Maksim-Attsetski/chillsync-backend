import { Base } from 'src/types';
import { UpdateNewsDto } from './update-news.dto';

type TDto = UpdateNewsDto & Base;

export class GetNewsDto implements TDto {
  title?: string;
  tag?: string;
  preview?: string;
  description?: string;
  _id: string;
  updated_at: Date | null;
  created_at: Date;
}
