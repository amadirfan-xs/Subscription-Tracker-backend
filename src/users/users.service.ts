import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Budget } from '@/budgets/entities/budget.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch current month budget if it exists
    const now = new Date();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();

    const monthBudget = await this.budgetsRepository.findOne({
      where: {
        user: { id },
        month: currentMonth,
        year: currentYear,
      },
    });

    if (monthBudget) {
      user.monthlyLimit = Number(monthBudget.amount);
    }

    return user;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const { displayName, professionalRole, reportingCurrency, avatarUrl } =
      updateData;
    const cleanData = {
      displayName,
      professionalRole,
      reportingCurrency,
      avatarUrl,
    };

    // Remove undefined fields
    Object.keys(cleanData).forEach(
      (key) => cleanData[key] === undefined && delete cleanData[key],
    );

    await this.usersRepository.update(id, cleanData);
    return this.findOne(id);
  }

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    const toUpdate = {
      displayName: data.displayName,
      professionalRole: data.professionalRole,
      reportingCurrency: data.reportingCurrency,
      avatarUrl: data.avatarUrl,
    };
    await this.usersRepository.update(id, toUpdate);
    return this.findOne(id);
  }

  async updateNotifications(id: string, data: any): Promise<User> {
    const toUpdate = {
      emailDigest: data.emailDigest,
      trialAlerts: data.trialAlerts,
      pushAlerts: data.pushAlerts,
      smsAlerts: data.smsAlerts,
    };
    await this.usersRepository.update(id, toUpdate);
    return this.findOne(id);
  }

  async updateMailSettings(id: string, data: any): Promise<User> {
    const toUpdate = {
      primaryEmail: data.primaryEmail,
      marketInsights: data.marketInsights,
      ledgerDigest: data.ledgerDigest,
      partnerOffers: data.partnerOffers,
      emailAesthetics: data.emailAesthetics,
      reportFrequency: data.reportFrequency,
    };
    await this.usersRepository.update(id, toUpdate);
    return this.findOne(id);
  }

  async updateBudgetSettings(id: string, data: any): Promise<User> {
    const toUpdate = {
      monthlyLimit: data.monthlyLimit,
      baseCurrency: data.baseCurrency,
      lowBalanceIntelligence: data.lowBalanceIntelligence,
      categoryBudgets: data.categoryBudgets,
    };
    await this.usersRepository.update(id, toUpdate);

    // Upsert current month budget
    const now = new Date();
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();

    let monthBudget = await this.budgetsRepository.findOne({
      where: {
        user: { id },
        month: currentMonth,
        year: currentYear,
      },
    });

    if (monthBudget) {
      monthBudget.amount = data.monthlyLimit;
      monthBudget.currency = data.baseCurrency || 'USD';
      await this.budgetsRepository.save(monthBudget);
    } else {
      monthBudget = this.budgetsRepository.create({
        amount: data.monthlyLimit,
        month: currentMonth,
        year: currentYear,
        currency: data.baseCurrency || 'USD',
        user: { id } as any,
      });
      await this.budgetsRepository.save(monthBudget);
    }

    return this.findOne(id);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    await this.usersRepository.update(userId, { avatarUrl });
    return { avatarUrl };
  }

  async getBudgetAnalytics(userId: string) {
    const user = await this.findOne(userId);
    const subscriptions = (await this.usersRepository.manager.find(
      'Subscription',
      {
        where: { user: { id: userId }, status: 'ACTIVE' },
      },
    )) as any[];

    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthSubscriptions = subscriptions.filter((s) => {
      const date = new Date(s.createdAt);
      return date >= startOfLastMonth && date <= endOfLastMonth;
    });

    const currentMonthSubscriptions = subscriptions.filter((s) => {
      const date = new Date(s.createdAt);
      return date >= startOfCurrentMonth;
    });

    const lastMonthSpend = lastMonthSubscriptions.reduce(
      (acc, s) => acc + Number(s.cost),
      0,
    );
    const currentMonthSpend = currentMonthSubscriptions.reduce(
      (acc, s) => acc + Number(s.cost),
      0,
    );
    const avgMonthlySpend =
      subscriptions.length > 0
        ? subscriptions.reduce((acc, s) => acc + Number(s.cost), 0) / 6
        : 0;
    const underBudgetPerc =
      user.monthlyLimit > 0
        ? Math.round(
            ((user.monthlyLimit - lastMonthSpend) / user.monthlyLimit) * 100,
          )
        : 0;
    const currentBudgetPerc =
      user.monthlyLimit > 0
        ? Math.round((currentMonthSpend / user.monthlyLimit) * 100)
        : 0;

    return {
      lastMonthSpend,
      currentMonthSpend,
      avgMonthlySpend,
      underBudgetPerc,
      currentBudgetPerc,
      expiringTrialsCount: subscriptions.filter(
        (s) =>
          s.isTrial &&
          new Date(s.trialEndDate) <=
            new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      ).length,
    };
  }
}
