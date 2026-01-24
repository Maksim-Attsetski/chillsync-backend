import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth';
import { UserSubsController } from './user-subs.controller';
import { UserSubSchema, UserSubscription } from './user-subs.entity';
import { UserSubsService } from './user-subs.service';

export const UserSubsModel = MongooseModule.forFeature([
  { name: UserSubscription.name, schema: UserSubSchema },
]);

@Module({
  imports: [UserSubsModel, AuthModule],
  controllers: [UserSubsController],
  providers: [UserSubsService],
  exports: [UserSubsModel, UserSubsService],
})
export class UserSubsModule {}
