import { Base } from 'src/types';
import { UpdateNewsDto } from './update-news.dto';

type TDto = UpdateNewsDto & Base;

export class GetNewsDto implements TDto {
  title?: string;
  tag?: string;
  preview?: string;
  updated_at: number;
  _id: string;
  created_at: number;
  description?: string;
}
