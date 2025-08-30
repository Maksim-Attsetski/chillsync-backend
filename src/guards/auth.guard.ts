import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { AuthService } from 'src/api';
import { getTokenFromRequest } from 'src/utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const { access, refresh } = getTokenFromRequest(request);

    if (refresh) {
      const res = await this.authService.validateToken(refresh, true);
      if (!!res) return true;
    }

    if (access) {
      const res = await this.authService.validateToken(access);
      if (!!res) return true;
    }

    return false;
  }
}
