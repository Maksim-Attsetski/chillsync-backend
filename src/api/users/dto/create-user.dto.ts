import { LoginUserDto } from './login-user.dto';

export enum ERoles {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export class CreateUserDto extends LoginUserDto {
  first_name: string;
  last_name: string;
  sex: 'male' | 'female';
  location: string | null;
}
