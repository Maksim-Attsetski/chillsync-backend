import { ERoles } from './create-user.dto';

export interface ITokenDto {
  email: string;
  user_agent: string;
  _id: string;
  role: ERoles;
}
