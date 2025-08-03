import { UpdateNewsDto } from './update-news.dto';

export class GetNewsDto extends UpdateNewsDto {
  _id: string;
  createdAt: number;

  constructor(model: GetNewsDto) {
    super();

    this.title = model?.title;
    this.description = model?.description;
    this.preview = model?.preview;
    this.tag = model?.tag;
    this._id = model?._id;
    this.createdAt = model?.createdAt;
  }
}
