import { Base } from 'src/types';
import { UpdateFriendDto } from './update-friends.dto';

type TDto = UpdateFriendDto & Base;

export class GetFriendDto implements TDto {
  user_ids?: string[];
  waiter?: string;
  message?: string;
  updated_at: number;
  _id: string;
  created_at: number;
}
