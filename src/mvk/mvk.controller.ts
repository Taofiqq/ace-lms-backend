/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MVKService } from './mvk.service';
import { CreateMVKRequirementDto } from './dto/create-mvk-requirement.dto';
import { CreateMVKCertificationDto } from './dto/create-mvk-certification.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { RequirementStatus } from './schemas/mvk-requirement.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('mvk')
export class MVKController {
  constructor(private readonly mvkService: MVKService) {}

  // MVK Requirements Endpoints
  @Post('requirements')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor')
  async createMVKRequirement(
    @Body() createMVKRequirementDto: CreateMVKRequirementDto,
  ) {
    return this.mvkService.createMVKRequirement(createMVKRequirementDto);
  }

  @Get('requirements')
  @UseGuards(AuthGuard('jwt'))
  async getAllMVKRequirements(
    @Query('college') college?: string,
    @Query('level') level?: string,
    @Query('type') type?: string,
  ) {
    return this.mvkService.getAllMVKRequirements({ college, level, type });
  }

  @Get('requirements/:id')
  @UseGuards(AuthGuard('jwt'))
  async getMVKRequirementById(@Param('id') id: string) {
    return this.mvkService.getMVKRequirementById(id);
  }

  @Put('requirements/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor')
  async updateMVKRequirement(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateMVKRequirementDto>,
  ) {
    return this.mvkService.updateMVKRequirement(id, updateData);
  }

  @Delete('requirements/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMVKRequirement(@Param('id') id: string) {
    return this.mvkService.deleteMVKRequirement(id);
  }

  // MVK Certification Endpoints
  @Post('certifications')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'instructor')
  async createMVKCertification(
    @Body() createMVKCertificationDto: CreateMVKCertificationDto,
  ) {
    return this.mvkService.createMVKCertification(createMVKCertificationDto);
  }

  @Get('certifications')
  @UseGuards(AuthGuard('jwt'))
  async getMVKCertifications(
    @Query('college') college?: string,
    @Query('level') level?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.mvkService.getMVKCertifications({
      college,
      level,
      isActive: isActive === undefined ? undefined : isActive === true,
    });
  }
  @Get('certifications/:id')
  @UseGuards(AuthGuard('jwt'))
  async getMVKCertificationById(@Param('id') id: string) {
    return this.mvkService.getMVKCertificationById(id);
  }

  // User Progress Endpoints
  @Put('progress')
  @UseGuards(AuthGuard('jwt'))
  async updateUserProgress(
    @Body() updateUserProgressDto: UpdateUserProgressDto,
  ) {
    return this.mvkService.updateUserProgress(updateUserProgressDto);
  }

  @Get('progress/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getUserProgress(
    @Param('userId') userId: string,
    @Query('college') college?: string,
    @Query('level') level?: string,
    @Query('status') status?: RequirementStatus,
  ) {
    return this.mvkService.getUserProgress(userId, { college, level, status });
  }

  @Get('progress/summary/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getUserProgressSummary(@Param('userId') userId: string) {
    return this.mvkService.getUserProgressSummary(userId);
  }

  @Get('progress/my')
  @UseGuards(AuthGuard('jwt'))
  async getMyProgress(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.mvkService.getUserProgressSummary(req.user.userId);
  }

  // User Certification Endpoints
  @Get('certifications/user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getUserCertifications(@Param('userId') userId: string) {
    return this.mvkService.getUserCertifications(userId);
  }

  @Get('certifications/my')
  @UseGuards(AuthGuard('jwt'))
  async getMyCertifications(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return this.mvkService.getUserCertifications(req.user.userId);
  }
}
