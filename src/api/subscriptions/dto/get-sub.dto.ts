import { UpdateSubDto } from './update-sub.dto';

export class GetSubDto extends UpdateSubDto {
  _id: string;
  createdAt: number;

  constructor(model: GetSubDto) {
    super();

    this.name = model?.name;
    this.price = model?.price;
    this.discount = model?.discount;
    this.description = model?.description;
    this.live_time = model?.live_time;
    this.points = model?.points ?? [];
    this._id = model?._id;
    this.createdAt = model?.createdAt;
  }
}
