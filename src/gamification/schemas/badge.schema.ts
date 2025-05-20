import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum BadgeCategory {
  COURSE_COMPLETION = 'course_completion',
  ASSESSMENT = 'assessment',
  ACHIEVEMENT = 'achievement',
  PARTICIPATION = 'participation',
  STREAK = 'streak',
}

export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

@Schema({ timestamps: true })
export class Badge extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: BadgeCategory,
    default: BadgeCategory.ACHIEVEMENT,
  })
  category: BadgeCategory;

  @Prop({
    type: String,
    enum: BadgeTier,
    default: BadgeTier.BRONZE,
  })
  tier: BadgeTier;

  @Prop()
  icon: string; // URL or path to badge icon

  @Prop({ default: 0 })
  pointValue: number; // Points earned when badge is awarded

  @Prop()
  criteria: string; // Description of how to earn the badge

  @Prop({ type: MongooseSchema.Types.Mixed })
  criteriaData: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);
