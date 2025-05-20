import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Question, QuestionType } from './schemas/question.schema';
import { Assessment } from './schemas/assessment.schema';
import { Submission, SubmissionStatus } from './schemas/submission.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { UsersService } from '../users/users.service';
import { MVKService } from '../mvk/mvk.service';
import { RequirementStatus } from '../mvk/schemas/mvk-requirement.schema';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @InjectModel(Assessment.name) private assessmentModel: Model<Assessment>,
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
    private usersService: UsersService,
    private mvkService: MVKService,
  ) {}

  private toStringId(id: any): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return typeof id === 'string' ? id : id.toString();
  }

  // Question Methods
  async createQuestion(
    createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    // Validate question data based on type
    this.validateQuestionData(createQuestionDto);

    const createdQuestion = new this.questionModel(createQuestionDto);
    return createdQuestion.save();
  }

  private validateQuestionData(questionDto: CreateQuestionDto): void {
    if (questionDto.type === QuestionType.MULTIPLE_CHOICE) {
      if (!questionDto.options || questionDto.options.length < 2) {
        throw new BadRequestException(
          'Multiple choice questions must have at least 2 options',
        );
      }

      if (
        typeof questionDto.correctAnswer !== 'number' ||
        questionDto.correctAnswer < 0 ||
        questionDto.correctAnswer >= questionDto.options.length
      ) {
        throw new BadRequestException(
          'Correct answer must be a valid option index',
        );
      }
    } else if (questionDto.type === QuestionType.TRUE_FALSE) {
      if (typeof questionDto.correctAnswer !== 'boolean') {
        throw new BadRequestException(
          'True/False questions must have a boolean correct answer',
        );
      }
    }
  }

  async getQuestionById(id: string): Promise<Question> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid question ID');
    }

    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  // Assessment Methods
  async createAssessment(
    createAssessmentDto: CreateAssessmentDto,
  ): Promise<Assessment> {
    const { embeddedQuestions, ...assessmentData } = createAssessmentDto;

    // Create assessment
    const createdAssessment = new this.assessmentModel(assessmentData);

    // Handle embedded questions if provided
    if (embeddedQuestions && embeddedQuestions.length > 0) {
      const questions = await Promise.all(
        embeddedQuestions.map((questionDto) =>
          this.createQuestion(questionDto),
        ),
      );

      createdAssessment.questions = questions;

      // Calculate total points
      const totalPoints = questions.reduce(
        (sum, q) => sum + (q.points || 1),
        0,
      );
      createdAssessment.totalPoints = totalPoints;
    } else if (
      assessmentData.questions &&
      assessmentData.questions.length > 0
    ) {
      // Validate existing questions
      const questionIds = assessmentData.questions;
      const questions = await this.questionModel
        .find({ _id: { $in: questionIds } })
        .exec();

      if (questions.length !== questionIds.length) {
        throw new BadRequestException('One or more question IDs are invalid');
      }

      // Calculate total points
      const totalPoints = questions.reduce(
        (sum, q) => sum + (q.points || 1),
        0,
      );
      createdAssessment.totalPoints = totalPoints;
    }

    return createdAssessment.save();
  }

  async getAssessments(filters?: {
    courseId?: string;
    moduleId?: string;
    isActive?: boolean;
  }): Promise<Assessment[]> {
    const query = this.assessmentModel.find();

    if (filters) {
      if (filters.courseId) query.where('courseId').equals(filters.courseId);
      if (filters.moduleId) query.where('moduleId').equals(filters.moduleId);
      if (filters.isActive !== undefined)
        query.where('isActive').equals(filters.isActive);
    }

    return query.populate('questions').exec();
  }

  async getAssessmentById(
    id: string,
    includeQuestions: boolean = true,
  ): Promise<Assessment> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid assessment ID');
    }

    const query = this.assessmentModel.findById(id);

    if (includeQuestions) {
      query.populate('questions');
    }

    const assessment = await query.exec();

    if (!assessment) {
      throw new NotFoundException(`Assessment with ID ${id} not found`);
    }

    return assessment;
  }

  // Submission Methods
  async startAssessment(
    userId: string,
    assessmentId: string,
  ): Promise<Submission> {
    if (!isValidObjectId(userId) || !isValidObjectId(assessmentId)) {
      throw new BadRequestException('Invalid user ID or assessment ID');
    }

    // Check if user exists
    const userExists = await this.usersService.userExists(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get assessment
    const assessment = await this.getAssessmentById(assessmentId);

    if (!assessment.isActive) {
      throw new BadRequestException('This assessment is not currently active');
    }

    // Check attempt limits
    if (assessment.maxAttempts > 0) {
      const attemptCount = await this.submissionModel
        .countDocuments({
          userId,
          assessmentId,
          status: SubmissionStatus.COMPLETED,
        })
        .exec();

      if (attemptCount >= assessment.maxAttempts) {
        throw new BadRequestException(
          `Maximum attempt limit (${assessment.maxAttempts}) reached for this assessment`,
        );
      }
    }

    // Create new submission
    const attemptNumber =
      (await this.submissionModel
        .countDocuments({
          userId,
          assessmentId,
        })
        .exec()) + 1;

    const submission = new this.submissionModel({
      userId,
      assessmentId,
      status: SubmissionStatus.IN_PROGRESS,
      startedAt: new Date(),
      attemptNumber,
      maxScore: assessment.totalPoints,
    });

    return submission.save();
  }

  async submitAssessment(
    userId: string,
    submissionDto: SubmitAssessmentDto,
  ): Promise<Submission> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Get assessment
    const assessment = await this.getAssessmentById(
      submissionDto.assessmentId,
      true,
    );

    // Find in-progress submission
    const submission = await this.submissionModel
      .findOne({
        userId,
        assessmentId: submissionDto.assessmentId,
        status: SubmissionStatus.IN_PROGRESS,
      })
      .exec();

    if (!submission) {
      throw new NotFoundException(
        'No active submission found for this assessment',
      );
    }

    // Process submitted answers
    submission.answers = new Map(Object.entries(submissionDto.answers));
    submission.submittedAt = new Date();
    submission.status = SubmissionStatus.COMPLETED;

    // Calculate time spent
    if (submission.startedAt) {
      const timeSpent = Math.floor(
        (submission.submittedAt.getTime() - submission.startedAt.getTime()) /
          1000,
      );
      submission.timeSpentSeconds = timeSpent;
    }

    // Grade the submission
    const gradedSubmission = await this.gradeSubmission(submission, assessment);

    // Update any related MVK requirements if passed
    if (gradedSubmission.passed) {
      try {
        // Check if this assessment is linked to any MVK requirements
        const mvkRequirements =
          await this.mvkService.findMVKRequirementsByItemId(
            this.toStringId(assessment._id),
            'assessment',
          );

        if (mvkRequirements && mvkRequirements.length > 0) {
          // Update MVK progress for each requirement
          for (const requirement of mvkRequirements) {
            await this.mvkService.updateUserProgress({
              userId,
              requirementId: this.toStringId(requirement._id),
              status: RequirementStatus.COMPLETED,
              progress: 100,
              score: gradedSubmission.scorePercentage,
            });
          }
        }
      } catch (error) {
        console.error('Failed to update MVK progress:', error);
      }
    }

    return gradedSubmission;
  }

  private async gradeSubmission(
    submission: Submission,
    assessment: Assessment,
  ): Promise<Submission> {
    let totalEarned = 0;
    const feedback = new Map<string, any>();

    // Get all questions for the assessment
    const questions = assessment.questions;
    const questionMap = new Map(
      questions.map((q) => [this.toStringId(q._id), q]),
    );

    // Grade each answer
    for (const [questionId, answer] of submission.answers.entries()) {
      const question = questionMap.get(questionId);

      if (!question) {
        feedback.set(questionId, {
          correct: false,
          message: 'Question not found in assessment',
        });
        continue;
      }

      const isCorrect = this.checkAnswer(question, answer);
      const points = isCorrect ? question.points || 1 : 0;
      totalEarned += points;

      feedback.set(questionId, {
        correct: isCorrect,
        points,
        maxPoints: question.points || 1,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        correctAnswer: question.correctAnswer,
        explanation: assessment.showExplanation
          ? question.explanation
          : undefined,
      });
    }

    // Calculate score
    submission.score = totalEarned;
    submission.maxScore = assessment.totalPoints;
    submission.scorePercentage = Math.round(
      (totalEarned / assessment.totalPoints) * 100,
    );
    submission.passed = submission.scorePercentage >= assessment.passingScore;
    submission.feedback = feedback;
    submission.status = SubmissionStatus.GRADED;
    submission.gradedAt = new Date();

    return submission.save();
  }

  private checkAnswer(question: Question, answer: any): boolean {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return answer === question.correctAnswer;

      case QuestionType.TRUE_FALSE:
        return answer === question.correctAnswer;

      case QuestionType.SHORT_ANSWER:
        // Simple string comparison - could be enhanced with more sophisticated text matching
        return (
          String(answer).trim().toLowerCase() ===
          String(question.correctAnswer).trim().toLowerCase()
        );

      case QuestionType.MATCHING:
        // Answer should be an array of matches that matches correctAnswer array
        if (!Array.isArray(answer) || !Array.isArray(question.correctAnswer)) {
          return false;
        }

        if (answer.length !== question.correctAnswer.length) {
          return false;
        }

        return answer.every(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (match, index) => match === question.correctAnswer[index],
        );

      default:
        return false;
    }
  }

  async getUserSubmissions(
    userId: string,
    assessmentId?: string,
  ): Promise<Submission[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const query = this.submissionModel.find({ userId });

    if (assessmentId) {
      if (!isValidObjectId(assessmentId)) {
        throw new BadRequestException('Invalid assessment ID');
      }

      query.where('assessmentId').equals(assessmentId);
    }

    return query.populate('assessmentId').sort({ createdAt: -1 }).exec();
  }

  async getSubmissionById(id: string): Promise<Submission> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid submission ID');
    }

    const submission = await this.submissionModel
      .findById(id)
      .populate('assessmentId')
      .exec();

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    return submission;
  }
}
