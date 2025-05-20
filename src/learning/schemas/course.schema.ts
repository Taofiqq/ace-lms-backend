import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Module } from './module.schema';

export enum CourseLevel {
  LEADER_I = 'Leader I',
  LEADER_II = 'Leader II',
  LEADER_III = 'Leader III',
}

export enum College {
  BUSINESS = 'Business & Growth',
  TECHNOLOGY = 'Technology & Innovation',
  OPERATIONS = 'Operational Excellence',
  GOVERNANCE = 'Governance & Risk',
  CUSTOMER = 'Customer Delight',
  LEADERSHIP = 'Leadership',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

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

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Module' }])
  modules: Module[];

  @Prop()
  thumbnail: string; // URL to course thumbnail image

  @Prop({ default: 0 })
  totalPoints: number; // Total points available in this course

  @Prop({ default: 0 })
  totalDurationMinutes: number; // Estimated time to complete

  @Prop({ default: [] })
  tags: string[]; // For searchability and categorization

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }] })
  prerequisites: Course[]; // Courses that should be completed before this one

  createdAt: Date;
  updatedAt: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
