import { IsNumber, IsDateString, IsNotEmpty } from 'class-validator';

export class AddUsageDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsDateString()
    @IsNotEmpty()
    date: string;
}
