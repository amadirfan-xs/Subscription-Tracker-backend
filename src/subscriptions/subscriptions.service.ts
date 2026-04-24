import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Subscription } from '@/subscriptions/entities/subscription.entity';
import { CreateSubscriptionDto } from '@/subscriptions/dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '@/subscriptions/dto/update-subscription.dto';
import { User } from '@/users/entities/user.entity';
import { SubscriptionStatus } from './subscriptions.status';

import { UsageLog } from './entities/usage-log.entity';
import { AddUsageDto } from './dto/add-usage.dto';

@Injectable()
export class SubscriptionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SubscriptionService.name);

  async onApplicationBootstrap() {
    this.logger.log(
      'Server started: Running immediate subscription expiration check...',
    );
    await this.handleSubscriptionExpirations();
  }
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(UsageLog)
    private usageLogRepository: Repository<UsageLog>,
  ) {}

  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    user: User,
  ): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      ...createSubscriptionDto,
      user,
    });
    return this.subscriptionRepository.save(subscription);
  }

  async findAllByUser(user: User): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { user: { id: user.id } },
    });
  }

  async findOneByUser(id: string, user: User): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { id, user: { id: user.id } },
    });
  }

  async update(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
    user: User,
  ): Promise<Subscription> {
    const subscription = await this.findOneByUser(id, user);
    if (!subscription) {
      throw new Error('Subscription not found or unauthorized');
    }
    Object.assign(subscription, updateSubscriptionDto);
    return this.subscriptionRepository.save(subscription);
  }

  async cancel(id: string, user: User): Promise<Subscription> {
    const subscription = await this.findOneByUser(id, user);
    if (!subscription) {
      throw new Error('Subscription not found or unauthorized');
    }
    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptionRepository.save(subscription);
  }

  async addUsage(id: string, dto: AddUsageDto, user: User): Promise<UsageLog> {
    const subscription = await this.findOneByUser(id, user);
    if (!subscription) {
      throw new Error('Subscription not found or unauthorized');
    }
    const usageLog = this.usageLogRepository.create({
      ...dto,
      subscription,
    });
    return this.usageLogRepository.save(usageLog);
  }

  async getUsage(id: string, user: User): Promise<UsageLog[]> {
    const subscription = await this.findOneByUser(id, user);
    if (!subscription) {
      throw new Error('Subscription not found or unauthorized');
    }
    return this.usageLogRepository.find({
      where: { subscription: { id } },
      order: { date: 'DESC' },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSubscriptionExpirations() {
    this.logger.log('Starting daily check for expired subscriptions...');

    try {
      const expiredSubscriptions = await this.subscriptionRepository.find({
        where: {
          status: SubscriptionStatus.ACTIVE,
          renewalDate: LessThan(new Date()),
        },
      });

      if (expiredSubscriptions.length > 0) {
        this.logger.log(
          `Found ${expiredSubscriptions.length} subscriptions to expire.`,
        );
        for (const sub of expiredSubscriptions) {
          sub.status = SubscriptionStatus.EXPIRED;
        }
        await this.subscriptionRepository.save(expiredSubscriptions);
        this.logger.log(
          `Successfully expired ${expiredSubscriptions.length} subscriptions.`,
        );
      } else {
        this.logger.log('No expired subscriptions found today.');
      }
    } catch (error) {
      this.logger.error(
        'Error occurred while attempting to check/expire subscriptions',
        error,
      );
    }
  }
}
