import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUrl,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CourseLevel, College, CourseStatus } from '../schemas/course.schema';
import { CreateModuleDto } from './create-module.dto';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @IsEnum(CourseLevel)
  @IsNotEmpty()
  level: CourseLevel;

  @IsEnum(College)
  @IsNotEmpty()
  college: College;

  @IsArray()
  @IsOptional()
  @Type(() => CreateModuleDto)
  modules?: CreateModuleDto[];

  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalPoints?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalDurationMinutes?: number;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsOptional()
  prerequisites?: string[]; // Array of course IDs
}
