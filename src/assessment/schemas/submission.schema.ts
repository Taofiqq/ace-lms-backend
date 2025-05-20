import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum SubmissionStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  GRADED = 'graded',
}

@Schema({ timestamps: true })
export class Submission extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
  })
  assessmentId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: SubmissionStatus,
    default: SubmissionStatus.IN_PROGRESS,
  })
  status: SubmissionStatus;

  @Prop({ type: Map, of: Object, default: {} })
  answers: Map<string, any>; // questionId -> answer

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  maxScore: number;

  @Prop({ default: 0 })
  scorePercentage: number;

  @Prop({ default: false })
  passed: boolean;

  @Prop()
  startedAt: Date;

  @Prop()
  submittedAt: Date;

  @Prop()
  gradedAt: Date;

  @Prop({ default: 0 })
  attemptNumber: number;

  @Prop({ type: Map, of: Object, default: {} })
  feedback: Map<string, any>; // questionId -> feedback

  @Prop()
  timeSpentSeconds: number;

  createdAt: Date;
  updatedAt: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
