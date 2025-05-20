import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CourseLevel, College } from '../../learning/schemas/course.schema';

export enum RequirementType {
  COURSE = 'course',
  ASSESSMENT = 'assessment',
  CAPSTONE = 'capstone',
}

export enum RequirementStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Schema({ timestamps: true })
export class MVKRequirement extends Document {
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

  @Prop({
    type: String,
    enum: RequirementType,
    required: true,
  })
  type: RequirementType;

  @Prop({ type: MongooseSchema.Types.ObjectId, refPath: 'type' })
  itemId: MongooseSchema.Types.ObjectId;

  @Prop({ default: true })
  isRequired: boolean;

  @Prop({ default: 1 })
  order: number;

  @Prop({ default: 0 })
  minScore: number; // Minimum score required (if applicable)

  createdAt: Date;
  updatedAt: Date;
}

export const MVKRequirementSchema =
  SchemaFactory.createForClass(MVKRequirement);
