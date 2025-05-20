import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  //   Max,
  ValidateIf,
} from 'class-validator';
import { QuestionType, DifficultyLevel } from '../schemas/question.schema';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @IsArray()
  @ValidateIf(
    (o) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      o.type === QuestionType.MULTIPLE_CHOICE ||
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      o.type === QuestionType.MATCHING,
  )
  options?: string[];

  @IsNotEmpty()
  correctAnswer: any;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @IsNumber()
  @IsOptional()
  @Min(0)
  points?: number;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
