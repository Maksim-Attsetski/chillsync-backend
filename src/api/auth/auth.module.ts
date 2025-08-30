import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UsersModule } from 'src/api';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionsModule } from '../sessions';

@Module({
  imports: [
    JwtModule,
    forwardRef(() => SessionsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
