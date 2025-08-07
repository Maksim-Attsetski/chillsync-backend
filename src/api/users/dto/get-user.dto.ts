import { ERoles } from './create-user.dto';

export class GetUserDto {
  _id: string;
  createdAt: number;
  email: string;
  first_name: string;
  last_name: string;
  sex: 'male' | 'female';
  location: [number, number];
  public_id: string;
  role: ERoles;
  providers: string[];
  blocked_at: number | null;
  updated_at: number | null;
  avatar: string | null;

  constructor(model?: Omit<GetUserDto, 'password'>) {
    this._id = model?._id ?? '';
    this.createdAt = model?.createdAt ?? 0;
    this.email = model?.email ?? '';
    this.first_name = model?.first_name ?? '';
    this.last_name = model?.last_name ?? '';
    this.public_id = model?.public_id ?? '';
    this.sex = model?.sex ?? 'male';
    this.role = model?.role ?? ERoles.USER;
    this.location = model?.location ?? [0, 0];
    this.providers = model?.providers ?? [];
    this.blocked_at = model?.blocked_at ?? 0;
    this.updated_at = model?.updated_at ?? 0;
    this.avatar = model?.avatar ?? null;
  }
}
