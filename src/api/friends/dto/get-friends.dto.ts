import { UpdateFriendDto } from './update-friends.dto';

export class GetFriendDto extends UpdateFriendDto {
  _id: string;
  createdAt: number;

  constructor(model: GetFriendDto) {
    super();

    this.user_ids = model?.user_ids;
    this.message = model?.message;
    this.waiter = model?.waiter;

    this._id = model?._id;
    this.createdAt = model?.createdAt;
  }
}
