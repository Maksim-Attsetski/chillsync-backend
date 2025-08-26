import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { FriendService } from './friends.service';
import { FriendController } from './friends.controller';
import { Friend, FriendSchema } from './friends.entity';
import { AuthModule } from '../auth';

export const FriendModel = MongooseModule.forFeature([
  { name: Friend.name, schema: FriendSchema },
]);

@Module({
  imports: [FriendModel, AuthModule],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [FriendService, FriendModel],
})
export class FriendModule {}
