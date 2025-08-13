// parsed-token.pipe.ts
import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  UnauthorizedException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class ParsedTokenPipe implements PipeTransform {
  constructor(private readonly jwtService: JwtService) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const req: Request = value;

    const authHeader = req?.headers?.['authorization'];

    try {
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const data = this.jwtService.decode(token);

        return data;
      }
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

// parsed-token.decorator.ts

export const ParsedToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest();
  },
);
