import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Config } from 'src/modules';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token: string | undefined = (
      request?.headers?.authorization ?? request?.headers?.Authorization
    )
      ?.split(' ')
      ?.at(-1);
    const refreshToken: string | undefined = request?.headers?.cookie
      ?.split('=')
      ?.at(-1);

    if (refreshToken) {
      const res = await this.jwtService.verifyAsync(refreshToken, {
        secret: Config.refreshSecret,
      });
      if (!!res) return true;
    }

    if (token) {
      const res = await this.jwtService.verifyAsync(token, {
        secret: Config.accessSecret,
      });
      if (!!res) return true;
    }

    return false;
  }
}
