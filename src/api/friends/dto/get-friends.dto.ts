import { Base } from 'src/types';
export class GetFriendDto implements Base {
  user_ids?: string[];
  waiter: string | null;
  message?: string | null;
  _id: string;
  updated_at: Date | null;
  created_at: Date;
}
