import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription, SubscriptionSchema } from './subscriptions.entity';
import { AuthModule } from '../auth';

export const subscriptionModel = MongooseModule.forFeature([
  { name: Subscription.name, schema: SubscriptionSchema },
]);

@Module({
  imports: [subscriptionModel, AuthModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [subscriptionModel, SubscriptionsService],
})
export class SubscriptionModule {}
