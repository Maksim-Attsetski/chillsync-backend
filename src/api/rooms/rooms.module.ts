import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { RoomStoreController } from './rooms.controller';
import { Room, RoomSchema } from './rooms.entity';
import { RoomStoreService } from './rooms.service';

export const RoomStoreModel = MongooseModule.forFeature([
  { name: Room.name, schema: RoomSchema },
]);

@Module({
  imports: [RoomStoreModel],
  controllers: [RoomStoreController],
  providers: [RoomStoreService, JwtService],
  exports: [RoomStoreService, RoomStoreModel],
})
export class RoomsStoreModule {}
