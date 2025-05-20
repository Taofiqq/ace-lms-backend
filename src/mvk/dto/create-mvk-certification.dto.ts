import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsMongoId,
  IsArray,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { CourseLevel, College } from '../../learning/schemas/course.schema';

export class CreateMVKCertificationDto {
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

  @IsArray()
  @IsMongoId({ each: true })
  requirements: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  requiredCompletionPercentage?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
