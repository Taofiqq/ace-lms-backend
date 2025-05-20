import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Badge, BadgeCategory, BadgeTier } from './schemas/badge.schema';
import { UserBadge } from './schemas/user-badge.schema';
import {
  Achievement,
  AchievementType,
  TriggerType,
} from './schemas/achievement.schema';
import { UserAchievement } from './schemas/user-achievement.schema';
import {
  PointTransaction,
  TransactionType,
  PointSource,
} from './schemas/point-transaction.schema';
import { Level } from './schemas/level.schema';
import { UserStats } from './schemas/user-stats.schema';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { CreateLevelDto } from './dto/create-level.dto';
import { AwardPointsDto } from './dto/award-points.dto';
import { AwardBadgeDto } from './dto/award-badge.dto';
import { UnlockAchievementDto } from './dto/unlock-achievement.dto';
import { UsersService } from '../users/users.service';
import { LearningService } from '../learning/learning.service';
import { AssessmentService } from '../assessment/assessment.service';

@Injectable()
export class GamificationService {
  constructor(
    @InjectModel(Badge.name) private badgeModel: Model<Badge>,
    @InjectModel(UserBadge.name) private userBadgeModel: Model<UserBadge>,
    @InjectModel(Achievement.name) private achievementModel: Model<Achievement>,
    @InjectModel(UserAchievement.name)
    private userAchievementModel: Model<UserAchievement>,
    @InjectModel(PointTransaction.name)
    private pointTransactionModel: Model<PointTransaction>,
    @InjectModel(Level.name) private levelModel: Model<Level>,
    @InjectModel(UserStats.name) private userStatsModel: Model<UserStats>,
    private usersService: UsersService,
    private learningService: LearningService,
    private assessmentService: AssessmentService,
  ) {}

  private toStringId(id: any): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return typeof id === 'string' ? id : id.toString();
  }

  // Badge Methods
  async createBadge(createBadgeDto: CreateBadgeDto): Promise<Badge> {
    const createdBadge = new this.badgeModel(createBadgeDto);
    return createdBadge.save();
  }

  async getAllBadges(filters?: {
    category?: BadgeCategory;
    tier?: BadgeTier;
    isActive?: boolean;
  }): Promise<Badge[]> {
    const query = this.badgeModel.find();

    if (filters) {
      if (filters.category) query.where('category').equals(filters.category);
      if (filters.tier) query.where('tier').equals(filters.tier);
      if (filters.isActive !== undefined)
        query.where('isActive').equals(filters.isActive);
    }

    return query.exec();
  }

  async getBadgeById(id: string): Promise<Badge> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid badge ID');
    }

    const badge = await this.badgeModel.findById(id).exec();

    if (!badge) {
      throw new NotFoundException(`Badge with ID ${id} not found`);
    }

    return badge;
  }

  async awardBadge(awardBadgeDto: AwardBadgeDto): Promise<UserBadge> {
    const { userId, badgeId, awardReason, isDisplayed } = awardBadgeDto;

    if (!isValidObjectId(userId) || !isValidObjectId(badgeId)) {
      throw new BadRequestException('Invalid user ID or badge ID');
    }

    // Check if user exists
    const userExists = await this.usersService.userExists(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if badge exists
    const badge = await this.getBadgeById(badgeId);

    // Check if user already has this badge
    const existingBadge = await this.userBadgeModel
      .findOne({
        userId,
        badgeId,
      })
      .exec();

    if (existingBadge) {
      throw new BadRequestException(`User already has badge: ${badge.name}`);
    }

    // Create user badge
    const userBadge = new this.userBadgeModel({
      userId,
      badgeId,
      awardedAt: new Date(),
      awardReason: awardReason || `Earned ${badge.name} badge`,
      isDisplayed: isDisplayed || false,
    });

    const savedUserBadge = await userBadge.save();

    // Award points if badge has point value
    if (badge.pointValue > 0) {
      await this.awardPoints({
        userId,
        amount: badge.pointValue,
        type: TransactionType.EARNED,
        source: PointSource.BADGE,
        referenceId: this.toStringId(badge._id),
        description: `Earned ${badge.pointValue} points for ${badge.name} badge`,
      });
    }

    // Update user stats
    await this.updateUserStats(userId);

    return savedUserBadge;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userBadgeModel
      .find({ userId })
      .populate('badgeId')
      .sort({ awardedAt: -1 })
      .exec();
  }

  // Achievement Methods
  async createAchievement(
    createAchievementDto: CreateAchievementDto,
  ): Promise<Achievement> {
    const { badgeId, ...achievementData } = createAchievementDto;

    // Validate badge ID if provided
    if (badgeId) {
      if (!isValidObjectId(badgeId)) {
        throw new BadRequestException('Invalid badge ID');
      }

      const badgeExists = await this.badgeModel.exists({ _id: badgeId });
      if (!badgeExists) {
        throw new NotFoundException(`Badge with ID ${badgeId} not found`);
      }
    }

    const createdAchievement = new this.achievementModel({
      ...achievementData,
      badgeId,
    });

    return createdAchievement.save();
  }

  async getAllAchievements(filters?: {
    type?: AchievementType;
    isActive?: boolean;
  }): Promise<Achievement[]> {
    const query = this.achievementModel.find();

    if (filters) {
      if (filters.type) query.where('type').equals(filters.type);
      if (filters.isActive !== undefined)
        query.where('isActive').equals(filters.isActive);
    }

    return query.populate('badgeId').exec();
  }

  async getAchievementById(id: string): Promise<Achievement> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid achievement ID');
    }

    const achievement = await this.achievementModel
      .findById(id)
      .populate('badgeId')
      .exec();

    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }

    return achievement;
  }

  async unlockAchievement(
    unlockAchievementDto: UnlockAchievementDto,
  ): Promise<UserAchievement> {
    const { userId, achievementId, progress, metadata } = unlockAchievementDto;

    if (!isValidObjectId(userId) || !isValidObjectId(achievementId)) {
      throw new BadRequestException('Invalid user ID or achievement ID');
    }

    // Check if user exists
    const userExists = await this.usersService.userExists(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if achievement exists
    const achievement = await this.getAchievementById(achievementId);

    // Check if user already has this achievement
    const existingAchievement = await this.userAchievementModel
      .findOne({
        userId,
        achievementId,
      })
      .exec();

    if (existingAchievement) {
      // Update progress if specified
      if (progress !== undefined && progress > existingAchievement.progress) {
        existingAchievement.progress = progress;

        // Only mark as unlocked if progress is 100%
        if (progress >= 100 && !existingAchievement.unlockedAt) {
          existingAchievement.unlockedAt = new Date();

          // Award points if achievement has point value
          if (achievement.pointValue > 0) {
            await this.awardPoints({
              userId,
              amount: achievement.pointValue,
              type: TransactionType.EARNED,
              source: PointSource.ACHIEVEMENT,
              referenceId: this.toStringId(achievement._id),
              description: `Earned ${achievement.pointValue} points for ${achievement.name} achievement`,
            });
          }

          // Award badge if associated with achievement
          if (achievement.badgeId) {
            try {
              await this.awardBadge({
                userId,
                badgeId: this.toStringId(achievement.badgeId),
                awardReason: `Unlocked ${achievement.name} achievement`,
              });
            } catch (error) {
              // If badge already awarded, just ignore
              if (
                !(
                  error instanceof BadRequestException &&
                  error.message.includes('already has badge')
                )
              ) {
                throw error;
              }
            }
          }
        }

        // Update metadata if provided
        if (metadata) {
          existingAchievement.metadata = {
            ...existingAchievement.metadata,
            ...metadata,
          };
        }

        return existingAchievement.save();
      }

      return existingAchievement;
    }

    // Create new user achievement
    const userAchievement = new this.userAchievementModel({
      userId,
      achievementId,
      progress: progress || 100,
      metadata,
      unlockedAt: progress === undefined || progress >= 100 ? new Date() : null,
    });

    const savedUserAchievement = await userAchievement.save();

    // If achievement is fully unlocked (progress is 100%)
    if (progress === undefined || progress >= 100) {
      // Award points if achievement has point value
      if (achievement.pointValue > 0) {
        await this.awardPoints({
          userId,
          amount: achievement.pointValue,
          type: TransactionType.EARNED,
          source: PointSource.ACHIEVEMENT,
          referenceId: this.toStringId(achievement._id),
          description: `Earned ${achievement.pointValue} points for ${achievement.name} achievement`,
        });
      }

      // Award badge if associated with achievement
      if (achievement.badgeId) {
        try {
          await this.awardBadge({
            userId,
            badgeId: this.toStringId(achievement.badgeId),
            awardReason: `Unlocked ${achievement.name} achievement`,
          });
        } catch (error) {
          // If badge already awarded, just ignore
          if (
            !(
              error instanceof BadRequestException &&
              error.message.includes('already has badge')
            )
          ) {
            throw error;
          }
        }
      }
    }

    // Update user stats
    await this.updateUserStats(userId);

    return savedUserAchievement;
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userAchievementModel
      .find({ userId })
      .populate('achievementId')
      .sort({ unlockedAt: -1 })
      .exec();
  }

  // Points Methods
  async awardPoints(awardPointsDto: AwardPointsDto): Promise<PointTransaction> {
    const {
      userId,
      amount,
      type,
      source,
      referenceId,
      description,
      expirationDate,
    } = awardPointsDto;

    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check if user exists
    const userExists = await this.usersService.userExists(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate referenceId if provided
    if (referenceId && !isValidObjectId(referenceId)) {
      throw new BadRequestException('Invalid reference ID');
    }

    // Create point transaction
    const pointTransaction = new this.pointTransactionModel({
      userId,
      amount,
      type: type || TransactionType.EARNED,
      source,
      referenceId,
      description: description || `Earned ${amount} points from ${source}`,
      transactionDate: new Date(),
      expirationDate,
    });

    const savedTransaction = await pointTransaction.save();

    // Update user stats
    await this.updateUserStats(userId);

    // Check for level up
    await this.checkForLevelUp(userId);

    return savedTransaction;
  }

  async getUserPointTransactions(userId: string): Promise<PointTransaction[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.pointTransactionModel
      .find({ userId })
      .sort({ transactionDate: -1 })
      .exec();
  }

  async getUserPointsBalance(userId: string): Promise<{
    totalPoints: number;
    availablePoints: number;
    spentPoints: number;
    expiredPoints: number;
  }> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Get user stats if available
    const userStats = await this.userStatsModel.findOne({ userId }).exec();

    if (userStats) {
      return {
        totalPoints: userStats.totalPoints,
        availablePoints: userStats.availablePoints,
        spentPoints: userStats.spentPoints,
        expiredPoints: userStats.expiredPoints,
      };
    }

    // Calculate from transactions if stats not available
    const transactions = await this.pointTransactionModel
      .find({ userId })
      .exec();

    let totalPoints = 0;
    let availablePoints = 0;
    let spentPoints = 0;
    let expiredPoints = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === TransactionType.EARNED) {
        totalPoints += transaction.amount;

        if (!transaction.expired) {
          availablePoints += transaction.amount;
        } else {
          expiredPoints += transaction.amount;
        }
      } else if (transaction.type === TransactionType.SPENT) {
        spentPoints += transaction.amount;
      } else if (transaction.type === TransactionType.EXPIRED) {
        expiredPoints += transaction.amount;
      } else if (transaction.type === TransactionType.ADJUSTED) {
        totalPoints += transaction.amount;
        availablePoints += transaction.amount;
      }
    });

    return {
      totalPoints,
      availablePoints,
      spentPoints,
      expiredPoints,
    };
  }

  // Level Methods
  async createLevel(createLevelDto: CreateLevelDto): Promise<Level> {
    // Check if level number already exists
    const existingLevel = await this.levelModel
      .findOne({ number: createLevelDto.number })
      .exec();

    if (existingLevel) {
      throw new BadRequestException(
        `Level number ${createLevelDto.number} already exists`,
      );
    }

    // Ensure levels are created sequentially
    if (createLevelDto.number > 1) {
      const prevLevelExists = await this.levelModel.exists({
        number: createLevelDto.number - 1,
      });
      if (!prevLevelExists) {
        throw new BadRequestException(
          `Cannot create level ${createLevelDto.number} before creating level ${createLevelDto.number - 1}`,
        );
      }

      // Ensure points required are higher than previous level
      const prevLevel = await this.levelModel
        .findOne({ number: createLevelDto.number - 1 })
        .exec();

      if (!prevLevel) {
        throw new BadRequestException(
          `Previous level ${createLevelDto.number - 1} not found`,
        );
      }

      if (createLevelDto.pointsRequired <= prevLevel.pointsRequired) {
        throw new BadRequestException(
          `Level ${createLevelDto.number} must require more points than level ${createLevelDto.number - 1}`,
        );
      }
    }

    const createdLevel = new this.levelModel(createLevelDto);
    return createdLevel.save();
  }

  async getAllLevels(): Promise<Level[]> {
    return this.levelModel.find().sort({ number: 1 }).exec();
  }

  async getLevelById(id: string): Promise<Level> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid level ID');
    }

    const level = await this.levelModel.findById(id).exec();

    if (!level) {
      throw new NotFoundException(`Level with ID ${id} not found`);
    }

    return level;
  }

  async getLevelByNumber(number: number): Promise<Level> {
    const level = await this.levelModel.findOne({ number }).exec();

    if (!level) {
      throw new NotFoundException(`Level ${number} not found`);
    }

    return level;
  }

  async getUserLevel(userId: string): Promise<{
    currentLevel: Level;
    nextLevel?: Level;
    progress: number;
    pointsToNextLevel?: number;
  }> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Get user stats
    const userStats = await this.getUserStats(userId);

    // Get current level
    const currentLevel = await this.levelModel
      .findOne({ number: userStats.currentLevel })
      .exec();

    if (!currentLevel) {
      throw new NotFoundException(`Level ${userStats.currentLevel} not found`);
    }

    // Get next level if exists
    const nextLevel = await this.levelModel
      .findOne({ number: userStats.currentLevel + 1 })
      .exec();

    // Calculate progress to next level
    let progress = 100;
    let pointsToNextLevel = 0;

    if (nextLevel) {
      const pointsForCurrentLevel = currentLevel.pointsRequired;
      const pointsForNextLevel = nextLevel.pointsRequired;
      const pointsRange = pointsForNextLevel - pointsForCurrentLevel;
      const userPoints = userStats.totalPoints;

      if (userPoints >= pointsForNextLevel) {
        progress = 100;
      } else {
        const pointsAboveCurrentLevel = userPoints - pointsForCurrentLevel;
        progress = Math.floor((pointsAboveCurrentLevel / pointsRange) * 100);
        pointsToNextLevel = pointsForNextLevel - userPoints;
      }
    }

    return {
      currentLevel,
      nextLevel: nextLevel || undefined,
      progress,
      pointsToNextLevel: nextLevel ? pointsToNextLevel : undefined,
    };
  }

  private async checkForLevelUp(userId: string): Promise<boolean> {
    // Get user stats
    const userStats = await this.getUserStats(userId);

    // Get current level
    const currentLevel = await this.levelModel
      .findOne({ number: userStats.currentLevel })
      .exec();

    if (!currentLevel) {
      return false;
    }

    // Get next level if exists
    const nextLevel = await this.levelModel
      .findOne({ number: userStats.currentLevel + 1 })
      .exec();

    if (!nextLevel) {
      return false; // Already at max level
    }

    // Check if user has enough points for next level
    if (userStats.totalPoints >= nextLevel.pointsRequired) {
      // Level up!
      userStats.currentLevel = nextLevel.number;
      await userStats.save();

      // Award any level-up achievements
      try {
        const levelUpAchievement = await this.achievementModel
          .findOne({
            type: AchievementType.SPECIAL,
            'triggerCriteria.type': 'level_up',
            'triggerCriteria.level': nextLevel.number,
          })
          .exec();

        if (levelUpAchievement) {
          await this.unlockAchievement({
            userId,
            achievementId: this.toStringId(levelUpAchievement._id),
            metadata: { levelNumber: nextLevel.number },
          });
        }
      } catch (error) {
        console.error('Failed to award level-up achievement:', error);
      }

      return true;
    }

    return false;
  }

  // User Stats Methods
  async getUserStats(userId: string): Promise<UserStats> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Check if user exists
    const userExists = await this.usersService.userExists(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get or create user stats
    let userStats = await this.userStatsModel.findOne({ userId }).exec();

    if (!userStats) {
      userStats = new this.userStatsModel({
        userId,
        lastActivityAt: new Date(),
      });

      await userStats.save();
    }

    return userStats;
  }

  async updateUserStats(userId: string): Promise<UserStats> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Get user stats
    const userStats = await this.getUserStats(userId);

    // Update points totals
    const pointsBalance = await this.getUserPointsBalance(userId);
    userStats.totalPoints = pointsBalance.totalPoints;
    userStats.availablePoints = pointsBalance.availablePoints;
    userStats.spentPoints = pointsBalance.spentPoints;
    userStats.expiredPoints = pointsBalance.expiredPoints;

    // Update badge count
    const badgesCount = await this.userBadgeModel
      .countDocuments({ userId })
      .exec();
    userStats.badgesCount = badgesCount;

    // Update achievement count
    const achievementsCount = await this.userAchievementModel
      .countDocuments({
        userId,
        unlockedAt: { $ne: null },
      })
      .exec();
    userStats.achievementsCount = achievementsCount;

    // Update active badges
    const activeBadges = await this.userBadgeModel
      .find({ userId, isDisplayed: true })
      .exec();

    userStats.activeBadges = activeBadges.map((badge) =>
      this.toStringId(badge.badgeId),
    );

    // Update last activity
    userStats.lastActivityAt = new Date();

    // Save and return updated stats
    return userStats.save();
  }

  async getLeaderboard(limit: number = 10): Promise<
    Array<{
      userId: string;
      totalPoints: number;
      currentLevel: number;
      badgesCount: number;
      achievementsCount: number;
      userInfo?: any;
    }>
  > {
    const leaderboard = await this.userStatsModel
      .find()
      .sort({ totalPoints: -1, achievementsCount: -1, badgesCount: -1 })
      .limit(limit)
      .lean()
      .exec();

    // Enhance with basic user info and transform to expected type
    const enhancedLeaderboard = await Promise.all(
      leaderboard.map(async (entry) => {
        // Transform to expected type
        const transformedEntry = {
          userId: this.toStringId(entry.userId),
          totalPoints: entry.totalPoints || 0,
          currentLevel: entry.currentLevel || 1,
          badgesCount: entry.badgesCount || 0,
          achievementsCount: entry.achievementsCount || 0,
        };

        try {
          const userInfo = await this.usersService.getBasicUserInfo(
            this.toStringId(entry.userId),
          );
          return {
            ...transformedEntry,
            userInfo,
          };
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          return transformedEntry;
        }
      }),
    );

    return enhancedLeaderboard;
  }

  // Integration Methods
  async recordCourseCompletion(
    userId: string,
    courseId: string,
  ): Promise<void> {
    if (!isValidObjectId(userId) || !isValidObjectId(courseId)) {
      throw new BadRequestException('Invalid user ID or course ID');
    }

    try {
      // Get course details
      const course = await this.learningService.getCourseById(courseId);

      // Award points
      await this.awardPoints({
        userId,
        amount: course.totalPoints || 50, // Default to 50 if not specified
        source: PointSource.COURSE_COMPLETION,
        referenceId: courseId,
        description: `Completed course: ${course.title}`,
      });

      // Check for course completion achievements
      const achievements = await this.achievementModel
        .find({
          type: AchievementType.CONTENT_COMPLETION,
          'triggerCriteria.type': 'course_completion',
        })
        .exec();

      // Award achievements if criteria match
      for (const achievement of achievements) {
        const criteria = achievement.triggerCriteria;

        // Check if course matches any criteria
        let shouldAward = false;

        if (criteria.courseId && criteria.courseId === courseId) {
          shouldAward = true;
        } else if (criteria.college && course.college === criteria.college) {
          shouldAward = true;
        } else if (criteria.level && course.level === criteria.level) {
          shouldAward = true;
        } else if (criteria.any === true) {
          shouldAward = true;
        }

        if (shouldAward) {
          try {
            await this.unlockAchievement({
              userId,
              achievementId: this.toStringId(achievement._id),
              metadata: {
                courseId,
                courseTitle: course.title,
                completedAt: new Date(),
              },
            });
          } catch (error) {
            console.error(
              `Failed to award achievement ${achievement.name}:`,
              error,
            );
          }
        }
      }

      // Update courses completed count
      const userStats = await this.getUserStats(userId);
      userStats.coursesCompleted += 1;
      await userStats.save();
    } catch (error) {
      console.error('Failed to record course completion:', error);
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to record course completion: ${error.message}`,
      );
    }
  }

  async recordAssessmentCompletion(
    userId: string,
    submissionId: string,
  ): Promise<void> {
    if (!isValidObjectId(userId) || !isValidObjectId(submissionId)) {
      throw new BadRequestException('Invalid user ID or submission ID');
    }

    try {
      // Get submission details
      const submission =
        await this.assessmentService.getSubmissionById(submissionId);

      // Only process passed assessments
      if (!submission.passed) {
        return;
      }

      // Get assessment details
      const assessment = await this.assessmentService.getAssessmentById(
        this.toStringId(submission.assessmentId),
      );

      // Award points based on score
      const pointsEarned = Math.round(
        (submission.score / submission.maxScore) * assessment.totalPoints,
      );

      if (pointsEarned > 0) {
        await this.awardPoints({
          userId,
          amount: pointsEarned,
          source: PointSource.ASSESSMENT,
          referenceId: this.toStringId(submission.assessmentId),
          description: `Scored ${submission.scorePercentage}% on assessment: ${assessment.title}`,
        });
      }

      // Check for assessment achievements
      const achievements = await this.achievementModel
        .find({
          type: AchievementType.ASSESSMENT_SCORE,
        })
        .exec();

      // Award achievements if criteria match
      for (const achievement of achievements) {
        const criteria = achievement.triggerCriteria;
        let shouldAward = false;

        // Check score threshold
        if (
          criteria.minScore &&
          submission.scorePercentage >= criteria.minScore
        ) {
          // Check if assessment matches
          if (
            criteria.assessmentId &&
            criteria.assessmentId === this.toStringId(submission.assessmentId)
          ) {
            shouldAward = true;
          } else if (
            criteria.assessmentType &&
            assessment.type === criteria.assessmentType
          ) {
            shouldAward = true;
          } else if (criteria.any === true) {
            shouldAward = true;
          }
        }

        // Check perfect score achievement
        if (criteria.perfectScore && submission.scorePercentage === 100) {
          shouldAward = true;
        }

        if (shouldAward) {
          try {
            await this.unlockAchievement({
              userId,
              achievementId: this.toStringId(achievement._id),
              metadata: {
                assessmentId: this.toStringId(submission.assessmentId),
                assessmentTitle: assessment.title,
                score: submission.scorePercentage,
                completedAt: submission.submittedAt,
              },
            });
          } catch (error) {
            console.error(
              `Failed to award achievement ${achievement.name}:`,
              error,
            );
          }
        }
      }

      // Update assessments completed count
      const userStats = await this.getUserStats(userId);
      userStats.assessmentsCompleted += 1;
      await userStats.save();
    } catch (error) {
      console.error('Failed to record assessment completion:', error);
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Failed to record assessment completion: ${error.message}`,
      );
    }
  }

  // System Methods
  async initDefaultLevels(): Promise<Level[]> {
    const defaultLevels = [
      {
        number: 1,
        name: 'Novice',
        pointsRequired: 0,
        description: 'Beginning your learning journey',
      },
      {
        number: 2,
        name: 'Apprentice',
        pointsRequired: 100,
        description: 'Starting to build knowledge',
      },
      {
        number: 3,
        name: 'Practitioner',
        pointsRequired: 300,
        description: 'Developing practical skills',
      },
      {
        number: 4,
        name: 'Specialist',
        pointsRequired: 600,
        description: 'Specializing in your field',
      },
      {
        number: 5,
        name: 'Expert',
        pointsRequired: 1000,
        description: 'Demonstrating expertise',
      },
      {
        number: 6,
        name: 'Master',
        pointsRequired: 2000,
        description: 'Mastering complex concepts',
      },
      {
        number: 7,
        name: 'Grandmaster',
        pointsRequired: 4000,
        description: 'Among the most skilled',
      },
      {
        number: 8,
        name: 'Legend',
        pointsRequired: 8000,
        description: 'A leader in your field',
      },
    ];

    const existingLevels = await this.levelModel.find().exec();

    if (existingLevels.length > 0) {
      return existingLevels; // Levels already exist
    }

    // Create default levels
    const createdLevels = await Promise.all(
      defaultLevels.map((level) => this.createLevel(level)),
    );

    return createdLevels;
  }

  async initDefaultBadges(): Promise<Badge[]> {
    const defaultBadges = [
      {
        name: 'First Steps',
        description: 'Completed your first course',
        category: BadgeCategory.COURSE_COMPLETION,
        tier: BadgeTier.BRONZE,
        pointValue: 10,
        criteria: 'Complete your first course',
      },
      {
        name: 'Perfect Score',
        description: 'Achieved 100% on an assessment',
        category: BadgeCategory.ASSESSMENT,
        tier: BadgeTier.GOLD,
        pointValue: 50,
        criteria: 'Score 100% on any assessment',
      },
      {
        name: 'Quick Learner',
        description: 'Completed 5 courses',
        category: BadgeCategory.COURSE_COMPLETION,
        tier: BadgeTier.SILVER,
        pointValue: 30,
        criteria: 'Complete 5 courses',
      },
      {
        name: 'Knowledge Seeker',
        description: 'Reached Level 5',
        category: BadgeCategory.ACHIEVEMENT,
        tier: BadgeTier.GOLD,
        pointValue: 100,
        criteria: 'Reach Level 5',
      },
    ];

    const existingBadges = await this.badgeModel.find().exec();

    if (existingBadges.length > 0) {
      return existingBadges; // Badges already exist
    }

    // Create default badges
    const createdBadges = await Promise.all(
      defaultBadges.map((badge) => this.createBadge(badge)),
    );

    return createdBadges;
  }

  async initDefaultAchievements(): Promise<Achievement[]> {
    // First ensure badges exist
    const badges = await this.initDefaultBadges();
    const badgeMap = new Map(badges.map((badge) => [badge.name, badge._id]));

    const defaultAchievements = [
      {
        name: 'First Course Completed',
        description: 'You completed your first course',
        type: AchievementType.CONTENT_COMPLETION,
        triggerType: TriggerType.AUTOMATIC,
        pointValue: 25,
        triggerCriteria: {
          type: 'course_completion',
          count: 1,
        },
        badgeId: badgeMap.get('First Steps'),
      },
      {
        name: 'Assessment Ace',
        description: 'You scored 100% on an assessment',
        type: AchievementType.ASSESSMENT_SCORE,
        triggerType: TriggerType.AUTOMATIC,
        pointValue: 50,
        triggerCriteria: {
          perfectScore: true,
        },
        badgeId: badgeMap.get('Perfect Score'),
      },
      {
        name: 'Course Champion',
        description: 'You completed 5 courses',
        type: AchievementType.CONTENT_COMPLETION,
        triggerType: TriggerType.AUTOMATIC,
        pointValue: 75,
        triggerCriteria: {
          type: 'course_completion',
          count: 5,
        },
        badgeId: badgeMap.get('Quick Learner'),
      },
      {
        name: 'Level 5 Achieved',
        description: 'You reached Level 5',
        type: AchievementType.SPECIAL,
        triggerType: TriggerType.AUTOMATIC,
        pointValue: 100,
        triggerCriteria: {
          type: 'level_up',
          level: 5,
        },
        badgeId: badgeMap.get('Knowledge Seeker'),
      },
    ];

    const existingAchievements = await this.achievementModel.find().exec();

    if (existingAchievements.length > 0) {
      return existingAchievements; // Achievements already exist
    }

    // Create default achievements
    const createdAchievements = await Promise.all(
      defaultAchievements.map((achievement) =>
        this.createAchievement({
          ...achievement,
          badgeId: achievement.badgeId
            ? this.toStringId(achievement.badgeId)
            : undefined,
        }),
      ),
    );

    return createdAchievements;
  }
}
