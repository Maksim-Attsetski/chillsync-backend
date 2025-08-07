import { Module, forwardRef } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from 'src/api';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenSchema, Token } from './auth.entity';

export const TokenModel = MongooseModule.forFeature([
  { name: Token.name, schema: TokenSchema },
]);

@Module({
  imports: [
    forwardRef(() => JwtModule),
    forwardRef(() => TokenModel),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
