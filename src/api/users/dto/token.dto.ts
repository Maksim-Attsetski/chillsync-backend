import { ERoles } from './create-user.dto';

export interface ITokenDto {
  email: string;
  _id: string;
  role: ERoles;
}
