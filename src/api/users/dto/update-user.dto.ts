import { CreateUserDto, ERoles } from './create-user.dto';

export class UpdateUserDto extends CreateUserDto {
  public_id: string;
  role: ERoles;
  providers: string[];
  avatar: string | null;
  blockedAt: number | null;
}
