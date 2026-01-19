import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth';
import { FriendModule } from '../friends';
import { MailModule } from '../mail';
import { MovieReactionModule } from '../movie-reactions';
import { SessionsModule } from '../sessions';
import { UsersController } from './users.controller';
import { Users, UsersSchema } from './users.entity';
import { UsersService } from './users.service';

const UserModel = MongooseModule.forFeature([
  { name: Users.name, schema: UsersSchema },
]);

@Module({
  imports: [
    UserModel,
    forwardRef(() => MovieReactionModule),
    forwardRef(() => AuthModule),
    forwardRef(() => MailModule),
    FriendModule,
    SessionsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UserModel, UsersService],
})
export class UsersModule {}
