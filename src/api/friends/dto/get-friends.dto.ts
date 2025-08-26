import { Base } from 'src/types';
export class GetFriendDto implements Base {
  user_ids?: string[];
  waiter: string | null;
  message?: string | null;
  updated_at: number;
  _id: string;
  created_at: number;
}
