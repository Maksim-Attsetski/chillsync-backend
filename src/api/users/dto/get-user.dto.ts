import { UpdateUserDto } from './update-user.dto';

export class GetUserDto extends UpdateUserDto {
  _id: string;
  createdAt: number;

  constructor(model?: GetUserDto) {
    super();

    this._id = model?._id ?? '';
    this.createdAt = model?.createdAt ?? 0;
    this.email = model?.email ?? '';
    this.first_name = model?.first_name ?? '';
    this.last_name = model?.last_name ?? '';
    this.public_id = model?.public_id ?? '';
    this.sex = model?.sex ?? 'male';
    this.role = model?.role ?? '';
  }
}
