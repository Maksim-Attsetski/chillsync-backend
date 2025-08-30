import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users, UsersSchema } from './users.entity';
import { AuthModule } from '../auth';
import { FriendModule } from '../friends';
import { MovieReactionModule } from '../movie-reactions';
import { SessionsModule } from '../sessions';

const UserModel = MongooseModule.forFeature([
  { name: Users.name, schema: UsersSchema },
]);

@Module({
  imports: [
    UserModel,
    forwardRef(() => MovieReactionModule),
    forwardRef(() => AuthModule),
    FriendModule,
    SessionsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UserModel, UsersService],
})
export class UsersModule {}
