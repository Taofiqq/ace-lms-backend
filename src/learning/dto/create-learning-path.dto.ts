import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { CourseLevel, College } from '../schemas/course.schema';

export class CreateLearningPathDto {
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
  @IsOptional()
  courses?: string[]; // Array of course IDs

  @IsString()
  @IsOptional()
  certificate?: string;

  @IsBoolean()
  @IsOptional()
  isMVK?: boolean;
}
