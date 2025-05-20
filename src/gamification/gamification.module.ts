import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Badge, BadgeSchema } from './schemas/badge.schema';
import { UserBadge, UserBadgeSchema } from './schemas/user-badge.schema';
import { Achievement, AchievementSchema } from './schemas/achievement.schema';
import {
  UserAchievement,
  UserAchievementSchema,
} from './schemas/user-achievement.schema';
import {
  PointTransaction,
  PointTransactionSchema,
} from './schemas/point-transaction.schema';
import { Level, LevelSchema } from './schemas/level.schema';
import { UserStats, UserStatsSchema } from './schemas/user-stats.schema';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { UsersModule } from '../users/users.module';
import { LearningModule } from '../learning/learning.module';
import { AssessmentModule } from '../assessment/assessment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Badge.name, schema: BadgeSchema },
      { name: UserBadge.name, schema: UserBadgeSchema },
      { name: Achievement.name, schema: AchievementSchema },
      { name: UserAchievement.name, schema: UserAchievementSchema },
      { name: PointTransaction.name, schema: PointTransactionSchema },
      { name: Level.name, schema: LevelSchema },
      { name: UserStats.name, schema: UserStatsSchema },
    ]),
    UsersModule,
    LearningModule,
    AssessmentModule,
  ],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
