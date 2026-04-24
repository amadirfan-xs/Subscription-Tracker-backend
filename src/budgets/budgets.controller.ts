import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  @Post()
  setBudget(
    @Body(new ValidationPipe())
    body: { amount: number; month: string; year: number; currency?: string },
    @Request() req,
  ) {
    return this.budgetsService.createOrUpdate(
      body.amount,
      body.month,
      body.year,
      body.currency || 'USD',
      req.user,
    );
  }

  @Get('current')
  findCurrent(
    @Query('month') month: string,
    @Query('year') year: string,
    @Request() req,
  ) {
    const m = month || new Date().toLocaleString('default', { month: 'long' });
    const y = year ? parseInt(year) : new Date().getFullYear();
    return this.budgetsService.findCurrent(m, y, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.budgetsService.findAllByUser(req.user);
  }
}
