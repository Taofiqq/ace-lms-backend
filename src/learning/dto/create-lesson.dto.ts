import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ContentType } from '../schemas/lesson.schema';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ContentType)
  @IsOptional()
  contentType?: ContentType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  durationMinutes?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  points?: number;
}
