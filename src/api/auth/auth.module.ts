import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule, SessionsModule, MailModule } from 'src/api';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    forwardRef(() => JwtModule),
    forwardRef(() => SessionsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => MailModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
