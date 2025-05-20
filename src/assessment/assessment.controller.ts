import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  //   HttpStatus,
  //   HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AssessmentService } from './assessment.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  // Question endpoints
  @Post('questions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor')
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.assessmentService.createQuestion(createQuestionDto);
  }

  @Get('questions/:id')
  @UseGuards(AuthGuard('jwt'))
  async getQuestionById(@Param('id') id: string) {
    return this.assessmentService.getQuestionById(id);
  }

  // Assessment endpoints
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor')
  async createAssessment(@Body() createAssessmentDto: CreateAssessmentDto) {
    return this.assessmentService.createAssessment(createAssessmentDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAssessments(
    @Query('courseId') courseId?: string,
    @Query('moduleId') moduleId?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.assessmentService.getAssessments({
      courseId,
      moduleId,
      isActive: isActive === undefined ? undefined : isActive === true,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getAssessmentById(
    @Param('id') id: string,
    @Query('includeQuestions') includeQuestions?: boolean,
  ) {
    return this.assessmentService.getAssessmentById(
      id,
      includeQuestions !== false,
    );
  }

  // Submission endpoints
  @Post(':id/start')
  @UseGuards(AuthGuard('jwt'))
  async startAssessment(@Request() req, @Param('id') assessmentId: string) {
    return this.assessmentService.startAssessment(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.user.userId,
      assessmentId,
    );
  }

  @Post('submit')
  @UseGuards(AuthGuard('jwt'))
  async submitAssessment(
    @Request() req,
    @Body() submitAssessmentDto: SubmitAssessmentDto,
  ) {
    return this.assessmentService.submitAssessment(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.user.userId,
      submitAssessmentDto,
    );
  }

  @Get('submissions/my')
  @UseGuards(AuthGuard('jwt'))
  async getMySubmissions(
    @Request() req,
    @Query('assessmentId') assessmentId?: string,
  ) {
    return this.assessmentService.getUserSubmissions(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.user.userId,
      assessmentId,
    );
  }

  @Get('submissions/:id')
  @UseGuards(AuthGuard('jwt'))
  async getSubmissionById(@Param('id') id: string) {
    return this.assessmentService.getSubmissionById(id);
  }
}
