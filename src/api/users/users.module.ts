import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users, UsersSchema } from './users.entity';
import { AuthService } from '../auth';
import { TokenModel } from '../auth/auth.module';

const UserModel = MongooseModule.forFeature([
  { name: Users.name, schema: UsersSchema },
]);

@Module({
  imports: [UserModel, TokenModel],
  controllers: [UsersController],
  providers: [UsersService, AuthService, JwtService],
  exports: [UserModel, UsersService],
})
export class UsersModule {}
