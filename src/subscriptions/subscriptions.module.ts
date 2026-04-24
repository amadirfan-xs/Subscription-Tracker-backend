import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from './entities/subscription.entity';
import { UsageLog } from './entities/usage-log.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Subscription, UsageLog])],
    providers: [SubscriptionService],
    controllers: [SubscriptionsController],
})
export class SubscriptionsModule { }
