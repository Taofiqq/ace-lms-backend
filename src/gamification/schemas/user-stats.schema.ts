import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class UserStats extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0 })
  totalPoints: number;

  @Prop({ default: 0 })
  availablePoints: number;

  @Prop({ default: 0 })
  spentPoints: number;

  @Prop({ default: 0 })
  expiredPoints: number;

  @Prop({ default: 1 })
  currentLevel: number;

  @Prop({ default: 0 })
  badgesCount: number;

  @Prop({ default: 0 })
  achievementsCount: number;

  @Prop({ default: 0 })
  coursesCompleted: number;

  @Prop({ default: 0 })
  assessmentsCompleted: number;

  @Prop({ default: 0 })
  streak: number; // Current login/learning streak

  @Prop()
  lastActivityAt: Date;

  @Prop({ default: 0 })
  totalTimeSpentMinutes: number;

  @Prop({ type: [String], default: [] })
  activeBadges: string[]; // IDs of badges user has chosen to display

  createdAt: Date;
  updatedAt: Date;
}

export const UserStatsSchema = SchemaFactory.createForClass(UserStats);
