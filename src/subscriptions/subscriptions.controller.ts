import { Controller, Get, Post, Body, UseGuards, Request, ValidationPipe, Param, NotFoundException, Patch } from '@nestjs/common';
import { SubscriptionService } from '@/subscriptions/subscriptions.service';
import { CreateSubscriptionDto } from '@/subscriptions/dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '@/subscriptions/dto/update-subscription.dto';
import { AddUsageDto } from '@/subscriptions/dto/add-usage.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
    constructor(private subscriptionService: SubscriptionService) { }

    @Post()
    create(@Body(new ValidationPipe()) createSubscriptionDto: CreateSubscriptionDto, @Request() req) {
        return this.subscriptionService.create(createSubscriptionDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.subscriptionService.findAllByUser(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.subscriptionService.findOneByUser(id, req.user);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body(new ValidationPipe()) updateSubscriptionDto: UpdateSubscriptionDto, @Request() req) {
        return this.subscriptionService.update(id, updateSubscriptionDto, req.user);
    }

    @Post(':id/cancel')
    cancel(@Param('id') id: string, @Request() req) {
        return this.subscriptionService.cancel(id, req.user);
    }

    @Post(':id/usage')
    addUsage(@Param('id') id: string, @Body(new ValidationPipe()) addUsageDto: AddUsageDto, @Request() req) {
        return this.subscriptionService.addUsage(id, addUsageDto, req.user);
    }

    @Get(':id/usage')
    getUsage(@Param('id') id: string, @Request() req) {
        return this.subscriptionService.getUsage(id, req.user);
    }
}
