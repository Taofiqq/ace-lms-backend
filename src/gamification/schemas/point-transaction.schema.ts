import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum TransactionType {
  EARNED = 'earned',
  SPENT = 'spent',
  EXPIRED = 'expired',
  ADJUSTED = 'adjusted',
}

export enum PointSource {
  COURSE_COMPLETION = 'course_completion',
  LESSON_COMPLETION = 'lesson_completion',
  ASSESSMENT = 'assessment',
  BADGE = 'badge',
  ACHIEVEMENT = 'achievement',
  LOGIN = 'login',
  REDEMPTION = 'redemption',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class PointTransaction extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({
    type: String,
    enum: TransactionType,
    required: true,
  })
  type: TransactionType;

  @Prop({
    type: String,
    enum: PointSource,
    required: true,
  })
  source: PointSource;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  referenceId: MongooseSchema.Types.ObjectId; // ID of related entity (course, badge, etc.)

  @Prop()
  description: string;

  @Prop({ required: true })
  transactionDate: Date;

  @Prop({ default: false })
  expired: boolean;

  @Prop()
  expirationDate: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const PointTransactionSchema =
  SchemaFactory.createForClass(PointTransaction);
