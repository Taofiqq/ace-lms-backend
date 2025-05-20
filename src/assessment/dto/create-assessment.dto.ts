import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsMongoId,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { AssessmentType } from '../schemas/assessment.schema';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class CreateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AssessmentType)
  @IsOptional()
  type?: AssessmentType;

  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  questions?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  timeLimit?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @IsMongoId()
  @IsOptional()
  courseId?: string;

  @IsMongoId()
  @IsOptional()
  moduleId?: string;

  @IsBoolean()
  @IsOptional()
  randomizeQuestions?: boolean;

  @IsBoolean()
  @IsOptional()
  showExplanation?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxAttempts?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Include embedded questions for creating questions alongside assessment
  @IsArray()
  @IsOptional()
  @Type(() => CreateQuestionDto)
  embeddedQuestions?: CreateQuestionDto[];
}
