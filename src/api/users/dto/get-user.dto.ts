export class GetUserDto {
  _id: string;
  createdAt: number;
  email: string;
  first_name: string;
  last_name: string;
  sex: 'male' | 'female';
  location: [number, number];
  public_id: string;
  role: string;
  providers: string[];

  constructor(model?: Omit<GetUserDto, 'password'>) {
    this._id = model?._id ?? '';
    this.createdAt = model?.createdAt ?? 0;
    this.email = model?.email ?? '';
    this.first_name = model?.first_name ?? '';
    this.last_name = model?.last_name ?? '';
    this.public_id = model?.public_id ?? '';
    this.sex = model?.sex ?? 'male';
    this.role = model?.role ?? '';
    this.location = model?.location ?? [0, 0];
    this.providers = model?.providers ?? [];
  }
}
