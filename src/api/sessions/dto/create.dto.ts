export class CreateSessionDto {
  refreshToken: string; // hash(plainRefresh)
  created_at: Date;
  user_id: string;
  device_name?: string;
  user_agent?: string;
  ip?: string;
  last_active_at: Date;
  expire_at?: Date;
}
