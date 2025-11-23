import { IsString, IsOptional, IsNumber, IsArray, IsUUID } from 'class-validator';

export class CreateLotDto {
  @IsUUID()
  auctionId: string;

  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  artist?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  medium?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsNumber()
  estimateLow: number;

  @IsNumber()
  estimateHigh: number;

  @IsOptional()
  @IsNumber()
  reservePrice?: number;

  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];
}
