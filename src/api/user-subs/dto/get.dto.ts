import { UpdateUserSubDto } from './update.dto';

export class GetUserSubDto extends UpdateUserSubDto {
  _id: string;
  createdAt: number;

  constructor(model: GetUserSubDto) {
    super();

    this.subId = model?.subId;
    this.userId = model?.userId;
    this.expitedAt = model?.expitedAt;
    this._id = model?._id;
    this.createdAt = model?.createdAt;
  }
}
