import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './schemas/question.schema';
import { Assessment, AssessmentSchema } from './schemas/assessment.schema';
import { Submission, SubmissionSchema } from './schemas/submission.schema';
import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';
import { UsersModule } from '../users/users.module';
import { MVKModule } from '../mvk/mvk.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Assessment.name, schema: AssessmentSchema },
      { name: Submission.name, schema: SubmissionSchema },
    ]),
    UsersModule,
    MVKModule,
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
