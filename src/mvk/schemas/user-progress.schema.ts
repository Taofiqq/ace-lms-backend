import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { RequirementStatus } from './mvk-requirement.schema';

@Schema({ timestamps: true })
export class UserProgress extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MVKRequirement',
    required: true,
  })
  requirementId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: RequirementStatus,
    default: RequirementStatus.NOT_STARTED,
  })
  status: RequirementStatus;

  @Prop({ default: 0 })
  progress: number; // 0-100 percentage

  @Prop({ default: 0 })
  score: number; // Score achieved (if applicable)

  @Prop()
  startedAt: Date;

  @Prop()
  completedAt: Date;

  @Prop({ default: 0 })
  timeSpentMinutes: number;

  createdAt: Date;
  updatedAt: Date;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
