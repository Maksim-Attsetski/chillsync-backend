// parsed-token.pipe.ts
import {
  ArgumentMetadata,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class ParsedTokenPipe implements PipeTransform {
  constructor(private readonly jwtService: JwtService) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const req: Request = value;

    const authHeader = req?.headers?.['authorization'];

    console.log(req?.headers);

    try {
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const data = this.jwtService.decode(token);

        if (!data) {
          throw new UnauthorizedException('Invalid or expired token');
        }

        const user_agent = req.headers['user-agent'] ?? 'unknown';
        return { ...data, user_agent };
      }
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
export const ParsedToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest();
  },
);
