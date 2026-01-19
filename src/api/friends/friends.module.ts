import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth';
import { FriendController } from './friends.controller';
import { Friend, FriendSchema } from './friends.entity';
import { FriendService } from './friends.service';

export const FriendModel = MongooseModule.forFeature([
  { name: Friend.name, schema: FriendSchema },
]);

@Module({
  imports: [FriendModel, forwardRef(() => AuthModule)],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService, FriendModel],
})
export class FriendModule {}
