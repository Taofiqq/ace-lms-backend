import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum AchievementType {
  COURSE_STREAK = 'course_streak',
  ASSESSMENT_SCORE = 'assessment_score',
  CONTENT_COMPLETION = 'content_completion',
  LOGIN_STREAK = 'login_streak',
  SPECIAL = 'special',
}

export enum TriggerType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
}

@Schema({ timestamps: true })
export class Achievement extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: AchievementType,
    default: AchievementType.CONTENT_COMPLETION,
  })
  type: AchievementType;

  @Prop({
    type: String,
    enum: TriggerType,
    default: TriggerType.AUTOMATIC,
  })
  triggerType: TriggerType;

  @Prop()
  icon: string; // URL or path to achievement icon

  @Prop({ default: 0 })
  pointValue: number; // Points earned when achievement is unlocked

  @Prop({ type: Object })
  triggerCriteria: Record<string, any>; // Criteria for automatic triggering

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Badge' })
  badgeId: MongooseSchema.Types.ObjectId; // Optional badge awarded with achievement

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
