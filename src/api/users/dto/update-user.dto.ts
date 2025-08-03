import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends CreateUserDto {
  public_id: string;
  role: string;
  providers: string[];
}
