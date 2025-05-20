import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Course } from './course.schema';
import { CourseLevel, College } from './course.schema';

@Schema({ timestamps: true })
export class LearningPath extends Document {
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

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Course' }])
  courses: Course[];

  @Prop()
  certificate: string; // Name of certificate earned upon completion

  @Prop({ default: false })
  isMVK: boolean; // Whether this learning path represents Minimum Viable Knowledge for a role

  createdAt: Date;
  updatedAt: Date;
}

export const LearningPathSchema = SchemaFactory.createForClass(LearningPath);
