import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class UserAchievement extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Achievement',
    required: true,
  })
  achievementId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  unlockedAt: Date;

  @Prop()
  progress: number; // For achievements with progress tracking (0-100)

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const UserAchievementSchema =
  SchemaFactory.createForClass(UserAchievement);
