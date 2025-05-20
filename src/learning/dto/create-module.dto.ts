import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLessonDto } from './create-lesson.dto';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  order?: number;

  @IsArray()
  @IsOptional()
  @Type(() => CreateLessonDto)
  lessons?: CreateLessonDto[];

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}
