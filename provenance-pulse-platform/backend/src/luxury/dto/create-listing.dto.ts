import { IsString, IsOptional, IsNumber, IsArray, IsUUID, IsObject } from 'class-validator';

export class CreateListingDto {
  @IsString()
  title: string;

  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsString()
  category: string;

  @IsNumber()
  askingPrice: number;

  @IsOptional()
  @IsUUID()
  sellerAccountId?: string;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
