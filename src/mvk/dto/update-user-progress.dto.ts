import {
  IsNotEmpty,
  IsMongoId,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDate,
  Min,
  Max,
} from 'class-validator';
import { RequirementStatus } from '../schemas/mvk-requirement.schema';
import { Type } from 'class-transformer';

export class UpdateUserProgressDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  requirementId: string;

  @IsEnum(RequirementStatus)
  @IsOptional()
  status?: RequirementStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  score?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startedAt?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  completedAt?: Date;

  @IsNumber()
  @IsOptional()
  @Min(0)
  timeSpentMinutes?: number;
}
