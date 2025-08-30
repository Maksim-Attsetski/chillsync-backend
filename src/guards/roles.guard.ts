import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { AuthService, ERoles } from 'src/api';
import { getTokenFromRequest } from 'src/utils';

class RolesGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async checkTokenRole(
    token?: string,
    isRefresh?: boolean,
    role: ERoles = ERoles.USER,
  ): Promise<boolean> {
    if (token) {
      const res = await this.authService.validateToken(token, isRefresh);
      if (!!res) return res?.role === role;
    }
    return false;
  }

  async findTokenData(
    context: ExecutionContext,
    role: ERoles = ERoles.USER,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { access, refresh } = getTokenFromRequest(request);

    const isValidByRefresh = await this.checkTokenRole(refresh, true, role);
    if (isValidByRefresh) return true;

    const isValidByAccess = await this.checkTokenRole(access, false, role);
    if (isValidByAccess) return true;

    return false;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return await this.findTokenData(context);
  }
}

@Injectable()
export class IsAdminGuard implements CanActivate {
  guard: RolesGuard;
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {
    this.guard = new RolesGuard(authService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return await this.guard.findTokenData(context, ERoles.ADMIN);
  }
}

// MARK , add more classes, if will be more roles
