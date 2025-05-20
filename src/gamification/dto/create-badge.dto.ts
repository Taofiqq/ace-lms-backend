import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
} from 'class-validator';
import { BadgeCategory, BadgeTier } from '../schemas/badge.schema';

export class CreateBadgeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(BadgeCategory)
  @IsOptional()
  category?: BadgeCategory;

  @IsEnum(BadgeTier)
  @IsOptional()
  tier?: BadgeTier;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pointValue?: number;

  @IsString()
  @IsOptional()
  criteria?: string;

  @IsObject()
  @IsOptional()
  criteriaData?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
