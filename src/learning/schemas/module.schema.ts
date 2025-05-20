import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Lesson } from './lesson.schema';

@Schema({ timestamps: true })
export class Module extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  order: number; // Position within a course

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'Lesson' }])
  lessons: Lesson[];

  @Prop({ default: false })
  isRequired: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);
