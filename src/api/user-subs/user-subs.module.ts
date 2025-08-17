import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { UserSubsService } from './user-subs.service';
import { UserSubsController } from './user-subs.controller';
import { UserSubscription, UserSubSchema } from './user-subs.entity';
import { AuthModule } from '../auth';

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
