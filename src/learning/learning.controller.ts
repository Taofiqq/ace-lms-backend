import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LearningService } from './learning.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateLearningPathDto } from './dto/create-learning-path.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  // Course Endpoints
  @Post('courses')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor', 'content_creator')
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.learningService.createCourse(createCourseDto);
  }

  @Get('courses')
  async getAllCourses(
    @Query('college') college?: string,
    @Query('level') level?: string,
    @Query('status') status?: string,
  ) {
    return this.learningService.getAllCourses({ college, level, status });
  }

  @Get('courses/:id')
  async getCourseById(@Param('id') id: string) {
    return this.learningService.getCourseById(id);
  }

  @Put('courses/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor', 'content_creator')
  async updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: Partial<CreateCourseDto>,
  ) {
    return this.learningService.updateCourse(id, updateCourseDto);
  }

  @Delete('courses/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourse(@Param('id') id: string) {
    return this.learningService.deleteCourse(id);
  }

  // Module Endpoints
  @Post('modules')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor', 'content_creator')
  async createModule(@Body() createModuleDto: CreateModuleDto) {
    return this.learningService.createModule(createModuleDto);
  }

  @Post('courses/:courseId/modules/:moduleId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor', 'content_creator')
  async addModuleToCourse(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.learningService.addModuleToCourse(courseId, moduleId);
  }

  // Lesson Endpoints
  @Post('lessons')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor', 'content_creator')
  async createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.learningService.createLesson(createLessonDto);
  }

  @Post('modules/:moduleId/lessons/:lessonId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor', 'content_creator')
  async addLessonToModule(
    @Param('moduleId') moduleId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.learningService.addLessonToModule(moduleId, lessonId);
  }

  // Learning Path Endpoints
  @Post('learning-paths')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor')
  async createLearningPath(
    @Body() createLearningPathDto: CreateLearningPathDto,
  ) {
    return this.learningService.createLearningPath(createLearningPathDto);
  }

  @Get('learning-paths/level/:level')
  async getLearningPathsByLevel(@Param('level') level: string) {
    return this.learningService.getLearningPathsByLevel(level);
  }

  @Get('learning-paths/college/:college')
  async getLearningPathsByCollege(@Param('college') college: string) {
    return this.learningService.getLearningPathsByCollege(college);
  }

  @Get('learning-paths/mvk')
  async getMVKLearningPaths() {
    return this.learningService.getMVKLearningPaths();
  }
}
