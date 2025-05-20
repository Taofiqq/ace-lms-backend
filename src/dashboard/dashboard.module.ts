import { Module } from '@nestjs/common';
// import { DashboardController } from './dashboard.controller';
// import { DashboardService } from './dashboard.service';
import { UsersModule } from '../users/users.module';
import { LearningModule } from '../learning/learning.module';
import { MVKModule } from '../mvk/mvk.module';
import { AssessmentModule } from '../assessment/assessment.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    UsersModule,
    LearningModule,
    MVKModule,
    AssessmentModule,
    GamificationModule,
  ],
  //   controllers: [DashboardController],
  //   providers: [DashboardService],
  //   exports: [DashboardService],
})
export class DashboardModule {}
