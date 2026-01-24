import { IBase } from 'src/types';
import { ERoles } from './create-user.dto';

export class GetUserDto implements IBase {
  email: string;
  first_name: string;
  last_name: string;
  sex: 'male' | 'female';
  location: string;
  public_id: string;
  role: ERoles;
  providers: string[];
  blocked_at: Date | null;
  _id: string;
  updated_at: Date | null;
  created_at: Date;
  avatar: string | null;

  constructor(model?: Omit<GetUserDto, 'password'> & IBase) {
    this._id = model?._id ?? '';
    this.created_at = model?.created_at ?? new Date();
    this.email = model?.email ?? '';
    this.first_name = model?.first_name ?? '';
    this.last_name = model?.last_name ?? '';
    this.public_id = model?.public_id ?? '';
    this.sex = model?.sex ?? 'male';
    this.role = model?.role ?? ERoles.USER;
    this.location = model?.location ?? '';
    this.providers = model?.providers ?? [];
    this.blocked_at = model?.blocked_at ?? new Date();
    this.updated_at = model?.updated_at ?? null;
    this.avatar = model?.avatar ?? null;
  }
}
