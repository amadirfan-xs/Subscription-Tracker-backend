import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateSubscriptionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    cost: number;

    @IsString()
    @IsNotEmpty()
    billingCycle: string;

    @IsString()
    @IsOptional()
    category?: string;

    @IsString()
    @IsOptional()
    planName?: string;

    @IsString()
    @IsOptional()
    paymentMethodType?: string; // e.g., 'CARD', 'BANK', 'MANUAL'

    @IsString()
    @IsOptional()
    paymentMethodDetail?: string; // e.g., '•••• 4242'

    @IsString()
    @IsOptional()
    notes?: string;

    @IsDateString()
    @IsOptional()
    renewalDate?: Date;
}
