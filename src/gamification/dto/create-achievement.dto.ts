import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsObject,
  IsMongoId,
  Min,
} from 'class-validator';
import { AchievementType, TriggerType } from '../schemas/achievement.schema';

export class CreateAchievementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AchievementType)
  @IsOptional()
  type?: AchievementType;

  @IsEnum(TriggerType)
  @IsOptional()
  triggerType?: TriggerType;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  pointValue?: number;

  @IsObject()
  @IsOptional()
  triggerCriteria?: Record<string, any>;

  @IsMongoId()
  @IsOptional()
  badgeId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
