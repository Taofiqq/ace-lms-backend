import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Question } from './question.schema';

export enum AssessmentType {
  QUIZ = 'quiz',
  TEST = 'test',
  EXAM = 'exam',
  SURVEY = 'survey',
}

@Schema({ timestamps: true })
export class Assessment extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: AssessmentType,
    default: AssessmentType.QUIZ,
  })
  type: AssessmentType;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Question' }])
  questions: Question[];

  @Prop({ default: 0 })
  timeLimit: number; // In minutes, 0 = no limit

  @Prop({ default: 70 })
  passingScore: number; // Percentage

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Course' })
  courseId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Module' })
  moduleId: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  randomizeQuestions: boolean;

  @Prop({ default: false })
  showExplanation: boolean;

  @Prop({ default: 1 })
  maxAttempts: number; // 0 = unlimited

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  totalPoints: number;

  createdAt: Date;
  updatedAt: Date;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
