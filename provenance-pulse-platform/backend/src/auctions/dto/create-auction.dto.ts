import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsNumber()
  expectedTotalHammerLow?: number;

  @IsOptional()
  @IsNumber()
  expectedTotalHammerHigh?: number;
}
