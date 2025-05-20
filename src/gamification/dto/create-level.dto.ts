import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
} from 'class-validator';

export class CreateLevelDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  number: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  pointsRequired: number;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsObject()
  @IsOptional()
  perks?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
