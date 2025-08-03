import { LoginUserDto } from './login-user.dto';

export class CreateUserDto extends LoginUserDto {
  first_name: string;
  last_name: string;
  sex: 'male' | 'female';
  location: [number, number];
}
