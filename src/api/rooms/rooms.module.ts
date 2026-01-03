import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Room, RoomSchema } from './rooms.entity';
import { RoomStoreService } from './rooms.service';

export const RoomStoreModel = MongooseModule.forFeature([
  { name: Room.name, schema: RoomSchema },
]);

@Module({
  imports: [RoomStoreModel],
  controllers: [],
  providers: [RoomStoreService],
  exports: [RoomStoreService, RoomStoreModel],
})
export class RoomsStoreModule {}
