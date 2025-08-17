import { Base } from 'src/types';
import { UpdateFriendDto } from './update-friends.dto';

type TDto = UpdateFriendDto & Base;

export class GetFriendDto implements TDto {
  user_ids?: string[];
  waiter?: string;
  message?: string;
  updatedAt: number;
  _id: string;
  createdAt: number;
}
