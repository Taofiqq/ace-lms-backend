import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class UserBadge extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Badge', required: true })
  badgeId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  awardedAt: Date;

  @Prop()
  awardReason: string;

  @Prop({ default: false })
  isDisplayed: boolean; // Whether user has chosen to display this badge

  createdAt: Date;
  updatedAt: Date;
}

export const UserBadgeSchema = SchemaFactory.createForClass(UserBadge);
