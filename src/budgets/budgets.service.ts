import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  async createOrUpdate(
    amount: number,
    month: string,
    year: number,
    currency: string,
    user: User,
  ): Promise<Budget> {
    let budget = await this.budgetRepository.findOne({
      where: { month, year, user: { id: user.id } },
    });

    if (budget) {
      budget.amount = amount;
      budget.currency = currency;
    } else {
      budget = this.budgetRepository.create({
        amount,
        month,
        year,
        currency,
        user,
      });
    }

    return this.budgetRepository.save(budget);
  }

  async findCurrent(
    month: string,
    year: number,
    user: User,
  ): Promise<Budget | null> {
    return this.budgetRepository.findOne({
      where: { month, year, user: { id: user.id } },
    });
  }

  async findAllByUser(user: User): Promise<Budget[]> {
    return this.budgetRepository.find({
      where: { user: { id: user.id } },
      order: { year: 'DESC', month: 'DESC' },
    });
  }
}
