import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users, UsersSchema } from './users.entity';
import { AuthModule } from '../auth';
import { FriendModule } from '../friends';

const UserModel = MongooseModule.forFeature([
  { name: Users.name, schema: UsersSchema },
]);

@Module({
  imports: [
    UserModel,
    forwardRef(() => AuthModule),
    forwardRef(() => FriendModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UserModel, UsersService],
})
export class UsersModule {}
