import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class UserCertification extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'MVKCertification',
    required: true,
  })
  certificationId: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ type: Date, default: null }) // Allow null values
  completedAt: Date | null;

  @Prop()
  certificateNumber: string;

  @Prop({ type: Date, default: null }) // Allow null values
  expiresAt: Date | null;

  @Prop({ default: false })
  isExpired: boolean;

  @Prop({ default: 0 })
  completionPercentage: number; // 0-100

  createdAt: Date;
  updatedAt: Date;
}

export const UserCertificationSchema =
  SchemaFactory.createForClass(UserCertification);
