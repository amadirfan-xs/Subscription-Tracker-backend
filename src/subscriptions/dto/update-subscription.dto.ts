import { IsString, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { SubscriptionStatus } from '../subscriptions.status';

export class UpdateSubscriptionDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    cost?: number;

    @IsString()
    @IsOptional()
    billingCycle?: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    planName?: string;

    @IsString()
    @IsOptional()
    paymentMethodType?: string;

    @IsString()
    @IsOptional()
    paymentMethodDetail?: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsDateString()
    @IsOptional()
    renewalDate?: Date;

    @IsEnum(SubscriptionStatus)
    @IsOptional()
    status?: SubscriptionStatus;
}
