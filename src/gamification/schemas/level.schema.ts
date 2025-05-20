import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Level extends Document {
  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  pointsRequired: number;

  @Prop()
  icon: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  perks: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const LevelSchema = SchemaFactory.createForClass(Level);
