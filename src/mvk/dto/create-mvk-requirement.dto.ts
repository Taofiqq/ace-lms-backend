import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { RequirementType } from '../schemas/mvk-requirement.schema';
import { CourseLevel, College } from '../../learning/schemas/course.schema';

export class CreateMVKRequirementDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CourseLevel)
  @IsNotEmpty()
  level: CourseLevel;

  @IsEnum(College)
  @IsNotEmpty()
  college: College;

  @IsEnum(RequirementType)
  @IsNotEmpty()
  type: RequirementType;

  @IsMongoId()
  @IsNotEmpty()
  itemId: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  minScore?: number;
}
