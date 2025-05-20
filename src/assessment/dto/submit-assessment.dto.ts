import {
  IsNotEmpty,
  IsMongoId,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsMongoId()
  questionId: string;

  @IsNotEmpty()
  answer: any;
}

export class SubmitAssessmentDto {
  @IsMongoId()
  @IsNotEmpty()
  assessmentId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => AnswerDto)
  answers: Record<string, any>; // questionId -> answer
}
