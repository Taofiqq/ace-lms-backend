import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  MATCHING = 'matching',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ required: true })
  text: string;

  @Prop({
    type: String,
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ type: MongooseSchema.Types.Mixed }) // Explicitly define as Mixed type
  correctAnswer: any; // Varies based on question type

  @Prop()
  explanation: string;

  @Prop({
    type: String,
    enum: DifficultyLevel,
    default: DifficultyLevel.MEDIUM,
  })
  difficulty: DifficultyLevel;

  @Prop({ default: 1 })
  points: number;

  @Prop({ default: [] })
  tags: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
