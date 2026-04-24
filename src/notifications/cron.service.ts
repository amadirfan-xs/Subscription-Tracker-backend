import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklySummary() {
    this.logger.log('Starting weekly spend summary extraction...');
    const users = await this.userRepository.find({
      where: { emailDigest: true },
    });

    for (const user of users) {
      this.logger.log(`[Weekly Summary] Simulating email for ${user.email}`);
      // In a real app, calculate spend and send email here
    }
    this.logger.log(`Weekly summaries processed for ${users.length} users.`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleTrialAlerts() {
    this.logger.log('Checking for active trials near expiration...');
    const users = await this.userRepository.find({
      where: { trialAlerts: true },
    });

    for (const user of users) {
      this.logger.log(`[Trial Alert] Checking trial status for ${user.email}`);
      // Logic to find subscriptions with trialPeriod and 24h remaining
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleBudgetAlerts() {
    this.logger.log('Checking budget thresholds for intelligence alerts...');
    const users = await this.userRepository.find({
      where: { lowBalanceIntelligence: true },
      relations: ['subscriptions'],
    });

    for (const user of users) {
      const activeSubscriptions = (user.subscriptions || []).filter(
        (s) => s.status === 'ACTIVE',
      );
      const totalMonthlySpend = activeSubscriptions.reduce((acc, s) => {
        // Simplified: assuming 'monthly' for now, ideally handle yearly/weekly conversions
        return acc + Number(s.cost);
      }, 0);

      const threshold = user.monthlyLimit * 0.85;

      if (totalMonthlySpend > threshold) {
        this.logger.warn(
          `[Budget Alert] ${user.email} has exceeded 85% of their budget. Threshold: ${threshold}, Projected: ${totalMonthlySpend}`,
        );
        // In a real app, send email alert here
      }
    }
  }
}
