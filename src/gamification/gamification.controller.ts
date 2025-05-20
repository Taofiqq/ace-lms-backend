import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GamificationService } from './gamification.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { CreateLevelDto } from './dto/create-level.dto';
import { AwardPointsDto } from './dto/award-points.dto';
import { AwardBadgeDto } from './dto/award-badge.dto';
import { UnlockAchievementDto } from './dto/unlock-achievement.dto';
import { BadgeCategory, BadgeTier } from './schemas/badge.schema';
import { AchievementType } from './schemas/achievement.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  // Initialization endpoints
  @Post('init')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async initGamification() {
    const levels = await this.gamificationService.initDefaultLevels();
    const badges = await this.gamificationService.initDefaultBadges();
    const achievements =
      await this.gamificationService.initDefaultAchievements();

    return {
      success: true,
      message: 'Gamification system initialized successfully',
      data: {
        levelsCreated: levels.length,
        badgesCreated: badges.length,
        achievementsCreated: achievements.length,
      },
    };
  }

  // Badge endpoints
  @Post('badges')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor')
  async createBadge(@Body() createBadgeDto: CreateBadgeDto) {
    return this.gamificationService.createBadge(createBadgeDto);
  }

  @Get('badges')
  @UseGuards(AuthGuard('jwt'))
  async getAllBadges(
    @Query('category') category?: BadgeCategory,
    @Query('tier') tier?: BadgeTier,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.gamificationService.getAllBadges({
      category,
      tier,
      isActive: isActive === undefined ? undefined : isActive === true,
    });
  }

  @Get('badges/:id')
  @UseGuards(AuthGuard('jwt'))
  async getBadgeById(@Param('id') id: string) {
    return this.gamificationService.getBadgeById(id);
  }

  @Post('badges/award')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor')
  async awardBadge(@Body() awardBadgeDto: AwardBadgeDto) {
    return this.gamificationService.awardBadge(awardBadgeDto);
  }

  @Get('users/:userId/badges')
  @UseGuards(AuthGuard('jwt'))
  async getUserBadges(@Param('userId') userId: string) {
    return this.gamificationService.getUserBadges(userId);
  }

  @Get('my/badges')
  @UseGuards(AuthGuard('jwt'))
  async getMyBadges(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.gamificationService.getUserBadges(req.user.userId);
  }

  // Achievement endpoints
  @Post('achievements')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor')
  async createAchievement(@Body() createAchievementDto: CreateAchievementDto) {
    return this.gamificationService.createAchievement(createAchievementDto);
  }

  @Get('achievements')
  @UseGuards(AuthGuard('jwt'))
  async getAllAchievements(
    @Query('type') type?: AchievementType,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.gamificationService.getAllAchievements({
      type,
      isActive: isActive === undefined ? undefined : isActive === true,
    });
  }

  @Get('achievements/:id')
  @UseGuards(AuthGuard('jwt'))
  async getAchievementById(@Param('id') id: string) {
    return this.gamificationService.getAchievementById(id);
  }

  @Post('achievements/unlock')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor')
  async unlockAchievement(@Body() unlockAchievementDto: UnlockAchievementDto) {
    return this.gamificationService.unlockAchievement(unlockAchievementDto);
  }

  @Get('users/:userId/achievements')
  @UseGuards(AuthGuard('jwt'))
  async getUserAchievements(@Param('userId') userId: string) {
    return this.gamificationService.getUserAchievements(userId);
  }

  @Get('my/achievements')
  @UseGuards(AuthGuard('jwt'))
  async getMyAchievements(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.gamificationService.getUserAchievements(req.user.userId);
  }

  // Points endpoints
  @Post('points/award')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor')
  async awardPoints(@Body() awardPointsDto: AwardPointsDto) {
    return this.gamificationService.awardPoints(awardPointsDto);
  }

  @Get('users/:userId/points')
  @UseGuards(AuthGuard('jwt'))
  async getUserPointsBalance(@Param('userId') userId: string) {
    return this.gamificationService.getUserPointsBalance(userId);
  }

  @Get('my/points')
  @UseGuards(AuthGuard('jwt'))
  async getMyPointsBalance(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.gamificationService.getUserPointsBalance(req.user.userId);
  }

  @Get('users/:userId/points/transactions')
  @UseGuards(AuthGuard('jwt'))
  async getUserPointTransactions(@Param('userId') userId: string) {
    return this.gamificationService.getUserPointTransactions(userId);
  }

  @Get('my/points/transactions')
  @UseGuards(AuthGuard('jwt'))
  async getMyPointTransactions(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.gamificationService.getUserPointTransactions(req.user.userId);
  }

  // Level endpoints
  @Post('levels')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async createLevel(@Body() createLevelDto: CreateLevelDto) {
    return this.gamificationService.createLevel(createLevelDto);
  }

  @Get('levels')
  @UseGuards(AuthGuard('jwt'))
  async getAllLevels() {
    return this.gamificationService.getAllLevels();
  }

  @Get('levels/:id')
  @UseGuards(AuthGuard('jwt'))
  async getLevelById(@Param('id') id: string) {
    return this.gamificationService.getLevelById(id);
  }

  @Get('levels/number/:number')
  @UseGuards(AuthGuard('jwt'))
  async getLevelByNumber(@Param('number', ParseIntPipe) number: number) {
    return this.gamificationService.getLevelByNumber(number);
  }

  @Get('users/:userId/level')
  @UseGuards(AuthGuard('jwt'))
  async getUserLevel(@Param('userId') userId: string) {
    return this.gamificationService.getUserLevel(userId);
  }

  @Get('my/level')
  @UseGuards(AuthGuard('jwt'))
  async getMyLevel(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.gamificationService.getUserLevel(req.user.userId);
  }

  // User stats endpoints
  @Get('users/:userId/stats')
  @UseGuards(AuthGuard('jwt'))
  async getUserStats(@Param('userId') userId: string) {
    return this.gamificationService.getUserStats(userId);
  }

  @Get('my/stats')
  @UseGuards(AuthGuard('jwt'))
  async getMyStats(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.gamificationService.getUserStats(req.user.userId);
  }

  // Leaderboard endpoint
  @Get('leaderboard')
  @UseGuards(AuthGuard('jwt'))
  async getLeaderboard(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.gamificationService.getLeaderboard(limit);
  }

  // Integration endpoints
  @Post('record/course/:courseId/complete')
  @UseGuards(AuthGuard('jwt'))
  async recordCourseCompletion(
    @Request() req,
    @Param('courseId') courseId: string,
  ) {
    await this.gamificationService.recordCourseCompletion(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.user.userId,
      courseId,
    );
    return {
      success: true,
      message: 'Course completion recorded successfully',
    };
  }

  @Post('record/assessment/:submissionId/complete')
  @UseGuards(AuthGuard('jwt'))
  async recordAssessmentCompletion(
    @Request() req,
    @Param('submissionId') submissionId: string,
  ) {
    await this.gamificationService.recordAssessmentCompletion(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      req.user.userId,
      submissionId,
    );
    return {
      success: true,
      message: 'Assessment completion recorded successfully',
    };
  }
}
