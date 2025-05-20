import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema';
import { Module } from './schemas/module.schema';
import { Lesson } from './schemas/lesson.schema';
import { LearningPath } from './schemas/learning-path.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';

@Injectable()
export class LearningService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<Course>,
    @InjectModel(Module.name) private moduleModel: Model<Module>,
    @InjectModel(Lesson.name) private lessonModel: Model<Lesson>,
    @InjectModel(LearningPath.name)
    private learningPathModel: Model<LearningPath>,
  ) {}

  // Course Methods
  async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
    const createdCourse = new this.courseModel(createCourseDto);

    // If modules are provided, create them
    if (createCourseDto.modules && createCourseDto.modules.length > 0) {
      const modules = await Promise.all(
        createCourseDto.modules.map((moduleDto) =>
          this.createModule(moduleDto),
        ),
      );
      createdCourse.modules = modules;
    }

    return createdCourse.save();
  }

  async getAllCourses(filters?: {
    college?: string;
    level?: string;
    status?: string;
  }): Promise<Course[]> {
    const query = this.courseModel.find();

    if (filters) {
      if (filters.college) query.where('college').equals(filters.college);
      if (filters.level) query.where('level').equals(filters.level);
      if (filters.status) query.where('status').equals(filters.status);
    }

    return query.populate('modules').exec();
  }

  async getCourseById(id: string): Promise<Course> {
    const course = await this.courseModel
      .findById(id)
      .populate({
        path: 'modules',
        populate: {
          path: 'lessons',
        },
      })
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async updateCourse(
    id: string,
    updateCourseDto: Partial<CreateCourseDto>,
  ): Promise<Course> {
    const course = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async deleteCourse(id: string): Promise<void> {
    const result = await this.courseModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
  }

  // Module Methods
  async createModule(createModuleDto: CreateModuleDto): Promise<Module> {
    const createdModule = new this.moduleModel(createModuleDto);

    // If lessons are provided, create them
    if (createModuleDto.lessons && createModuleDto.lessons.length > 0) {
      const lessons = await Promise.all(
        createModuleDto.lessons.map((lessonDto) =>
          this.createLesson(lessonDto),
        ),
      );
      createdModule.lessons = lessons;
    }

    return createdModule.save();
  }

  async addModuleToCourse(courseId: string, moduleId: string): Promise<Course> {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const module = await this.moduleModel.findById(moduleId).exec();
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    if (!course.modules) {
      course.modules = [];
    }

    course.modules.push(module);
    return course.save();
  }

  // Lesson Methods
  async createLesson(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const createdLesson = new this.lessonModel(createLessonDto);
    return createdLesson.save();
  }

  async addLessonToModule(moduleId: string, lessonId: string): Promise<Module> {
    const module = await this.moduleModel.findById(moduleId).exec();
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    const lesson = await this.lessonModel.findById(lessonId).exec();
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    if (!module.lessons) {
      module.lessons = [];
    }

    module.lessons.push(lesson);
    return module.save();
  }

  // Learning Path Methods
  async createLearningPath(
    createLearningPathDto: CreateLearningPathDto,
  ): Promise<LearningPath> {
    const createdLearningPath = new this.learningPathModel(
      createLearningPathDto,
    );

    // If courses are provided, add them to the learning path
    if (
      createLearningPathDto.courses &&
      createLearningPathDto.courses.length > 0
    ) {
      const courses = await this.courseModel
        .find({ _id: { $in: createLearningPathDto.courses } })
        .exec();

      createdLearningPath.courses = courses;
    }

    return createdLearningPath.save();
  }

  async getLearningPathsByLevel(level: string): Promise<LearningPath[]> {
    return this.learningPathModel.find({ level }).populate('courses').exec();
  }

  async getLearningPathsByCollege(college: string): Promise<LearningPath[]> {
    return this.learningPathModel.find({ college }).populate('courses').exec();
  }

  async getMVKLearningPaths(): Promise<LearningPath[]> {
    return this.learningPathModel
      .find({ isMVK: true })
      .populate('courses')
      .exec();
  }
}
