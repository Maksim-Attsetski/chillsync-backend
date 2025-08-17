import { Base } from 'src/types';
import { UpdateNewsDto } from './update-news.dto';

type TDto = UpdateNewsDto & Base;

export class GetNewsDto implements TDto {
  title?: string;
  tag?: string;
  preview?: string;
  updatedAt: number;
  _id: string;
  createdAt: number;
  description?: string;
}
