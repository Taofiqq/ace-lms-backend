import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum ContentType {
  TEXT = 'text',
  VIDEO = 'video',
  PDF = 'pdf',
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
}

@Schema({ timestamps: true })
export class Lesson extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: ContentType,
    default: ContentType.TEXT,
  })
  contentType: ContentType;

  @Prop()
  content: string; // Could be text content or a URL to a resource

  @Prop({ default: 0 })
  order: number; // Position within a module

  @Prop({ default: 0 })
  durationMinutes: number; // Estimated time to complete

  @Prop({ default: 0 })
  points: number; // Points earned for completion

  createdAt: Date;
  updatedAt: Date;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
