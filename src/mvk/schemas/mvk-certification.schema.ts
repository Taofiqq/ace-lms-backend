import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CourseLevel, College } from '../../learning/schemas/course.schema';

@Schema({ timestamps: true })
export class MVKCertification extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: CourseLevel,
    required: true,
  })
  level: CourseLevel;

  @Prop({
    type: String,
    enum: College,
    required: true,
  })
  college: College;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'MVKRequirement' }])
  requirements: MongooseSchema.Types.ObjectId[];

  @Prop({ default: 100 })
  requiredCompletionPercentage: number; // Usually 100% for MVK

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const MVKCertificationSchema =
  SchemaFactory.createForClass(MVKCertification);
