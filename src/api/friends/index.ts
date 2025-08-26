import { FriendService } from './friends.service';
import { FriendController } from './friends.controller';
import { FriendModule } from './friends.module';
import { CreateFriendDto } from './dto/create-friends.dto';
import { GetFriendDto } from './dto/get-friends.dto';
export * from './friends.entity';

export {
  FriendService,
  FriendController,
  FriendModule,
  // dto
  CreateFriendDto,
  GetFriendDto,
};
