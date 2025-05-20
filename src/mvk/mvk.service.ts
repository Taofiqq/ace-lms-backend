import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import {
  MVKRequirement,
  RequirementStatus,
} from './schemas/mvk-requirement.schema';
import { MVKCertification } from './schemas/mvk-certification.schema';
import { UserProgress } from './schemas/user-progress.schema';
import { UserCertification } from './schemas/user-certification.schema';
import { CreateMVKRequirementDto } from './dto/create-mvk-requirement.dto';
import { CreateMVKCertificationDto } from './dto/create-mvk-certification.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { UsersService } from '../users/users.service';
import { randomUUID } from 'crypto';

@Injectable()
export class MVKService {
  constructor(
    @InjectModel(MVKRequirement.name)
    private mvkRequirementModel: Model<MVKRequirement>,
    @InjectModel(MVKCertification.name)
    private mvkCertificationModel: Model<MVKCertification>,
    @InjectModel(UserProgress.name)
    private userProgressModel: Model<UserProgress>,
    @InjectModel(UserCertification.name)
    private userCertificationModel: Model<UserCertification>,
    private usersService: UsersService,
  ) {}

  private toStringId(id: any): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return typeof id === 'string' ? id : id.toString();
  }

  // MVK Requirement Methods
  async createMVKRequirement(
    createMVKRequirementDto: CreateMVKRequirementDto,
  ): Promise<MVKRequirement> {
    const createdRequirement = new this.mvkRequirementModel(
      createMVKRequirementDto,
    );
    return createdRequirement.save();
  }

  async getAllMVKRequirements(filters?: {
    college?: string;
    level?: string;
    type?: string;
  }): Promise<MVKRequirement[]> {
    const query = this.mvkRequirementModel.find();

    if (filters) {
      if (filters.college) query.where('college').equals(filters.college);
      if (filters.level) query.where('level').equals(filters.level);
      if (filters.type) query.where('type').equals(filters.type);
    }

    return query.sort({ order: 1 }).exec();
  }

  async getMVKRequirementById(id: string): Promise<MVKRequirement> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid requirement ID');
    }

    const requirement = await this.mvkRequirementModel.findById(id).exec();
    if (!requirement) {
      throw new NotFoundException(`MVK Requirement with ID ${id} not found`);
    }

    return requirement;
  }

  async updateMVKRequirement(
    id: string,
    updateData: Partial<CreateMVKRequirementDto>,
  ): Promise<MVKRequirement> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid requirement ID');
    }

    const requirement = await this.mvkRequirementModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!requirement) {
      throw new NotFoundException(`MVK Requirement with ID ${id} not found`);
    }

    return requirement;
  }

  async deleteMVKRequirement(id: string): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid requirement ID');
    }

    const result = await this.mvkRequirementModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`MVK Requirement with ID ${id} not found`);
    }

    // Also delete any user progress related to this requirement
    await this.userProgressModel.deleteMany({ requirementId: id }).exec();
  }

  // MVK Certification Methods
  async createMVKCertification(
    createMVKCertificationDto: CreateMVKCertificationDto,
  ): Promise<MVKCertification> {
    // Validate that all requirements exist
    for (const reqId of createMVKCertificationDto.requirements) {
      if (!isValidObjectId(reqId)) {
        throw new BadRequestException(`Invalid requirement ID: ${reqId}`);
      }

      const reqExists = await this.mvkRequirementModel.exists({ _id: reqId });
      if (!reqExists) {
        throw new NotFoundException(`Requirement with ID ${reqId} not found`);
      }
    }

    const createdCertification = new this.mvkCertificationModel(
      createMVKCertificationDto,
    );
    return createdCertification.save();
  }

  async getMVKCertifications(filters?: {
    college?: string;
    level?: string;
    isActive?: boolean;
  }): Promise<MVKCertification[]> {
    const query = this.mvkCertificationModel.find();

    if (filters) {
      if (filters.college) query.where('college').equals(filters.college);
      if (filters.level) query.where('level').equals(filters.level);
      if (filters.isActive !== undefined)
        query.where('isActive').equals(filters.isActive);
    }

    return query.populate('requirements').exec();
  }

  async getMVKCertificationById(id: string): Promise<MVKCertification> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid certification ID');
    }

    const certification = await this.mvkCertificationModel
      .findById(id)
      .populate('requirements')
      .exec();

    if (!certification) {
      throw new NotFoundException(`MVK Certification with ID ${id} not found`);
    }

    return certification;
  }

  // User Progress Methods
  async updateUserProgress(
    updateUserProgressDto: UpdateUserProgressDto,
  ): Promise<UserProgress> {
    const { userId, requirementId } = updateUserProgressDto;

    if (!isValidObjectId(userId) || !isValidObjectId(requirementId)) {
      throw new BadRequestException('Invalid user ID or requirement ID');
    }

    // Check if user exists
    const userExists = await this.usersService.userExists(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if requirement exists
    const requirementExists = await this.mvkRequirementModel.exists({
      _id: requirementId,
    });
    if (!requirementExists) {
      throw new NotFoundException(
        `Requirement with ID ${requirementId} not found`,
      );
    }

    // Find existing progress or create new
    let userProgress = await this.userProgressModel
      .findOne({
        userId,
        requirementId,
      })
      .exec();

    if (!userProgress) {
      userProgress = new this.userProgressModel({
        userId,
        requirementId,
        status: RequirementStatus.NOT_STARTED,
        progress: 0,
        score: 0,
      });
    }

    // Update fields
    if (updateUserProgressDto.status) {
      userProgress.status = updateUserProgressDto.status;

      // If status changed to in progress and no start date, set it
      if (
        updateUserProgressDto.status === RequirementStatus.IN_PROGRESS &&
        !userProgress.startedAt
      ) {
        userProgress.startedAt = new Date();
      }

      // If status changed to completed and no completion date, set it
      if (
        updateUserProgressDto.status === RequirementStatus.COMPLETED &&
        !userProgress.completedAt
      ) {
        userProgress.completedAt = new Date();
        userProgress.progress = 100; // Ensure progress is 100% when completed
      }
    }

    if (updateUserProgressDto.progress !== undefined) {
      userProgress.progress = updateUserProgressDto.progress;

      // Auto-update status based on progress
      if (userProgress.progress === 0) {
        userProgress.status = RequirementStatus.NOT_STARTED;
      } else if (userProgress.progress < 100) {
        userProgress.status = RequirementStatus.IN_PROGRESS;
        if (!userProgress.startedAt) {
          userProgress.startedAt = new Date();
        }
      } else if (userProgress.progress >= 100) {
        userProgress.status = RequirementStatus.COMPLETED;
        userProgress.progress = 100; // Ensure not over 100%
        if (!userProgress.completedAt) {
          userProgress.completedAt = new Date();
        }
      }
    }

    if (updateUserProgressDto.score !== undefined) {
      userProgress.score = updateUserProgressDto.score;
    }

    if (updateUserProgressDto.timeSpentMinutes !== undefined) {
      userProgress.timeSpentMinutes = updateUserProgressDto.timeSpentMinutes;
    }

    const savedProgress = await userProgress.save();

    // After updating progress, check if any certifications need to be updated
    await this.checkCertificationProgress(userId);

    return savedProgress;
  }

  async getUserProgress(
    userId: string,
    filters?: {
      college?: string;
      level?: string;
      status?: RequirementStatus;
    },
  ): Promise<UserProgress[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const userExists = await this.usersService.userExists(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // First find requirements that match filters
    const requirementQuery = this.mvkRequirementModel.find();
    if (filters) {
      if (filters.college)
        requirementQuery.where('college').equals(filters.college);
      if (filters.level) requirementQuery.where('level').equals(filters.level);
    }

    const requirements = await requirementQuery.exec();
    const requirementIds = requirements.map((r) => r._id);

    // Then find progress for these requirements
    const progressQuery = this.userProgressModel.find({
      userId,
      requirementId: { $in: requirementIds },
    });

    if (filters && filters.status) {
      progressQuery.where('status').equals(filters.status);
    }

    return progressQuery.populate('requirementId').exec();
  }

  async getUserProgressSummary(userId: string): Promise<{
    totalRequirements: number;
    completedRequirements: number;
    inProgressRequirements: number;
    notStartedRequirements: number;
    overallProgress: number;
    certifications: {
      certificationId: string;
      title: string;
      progress: number;
      isCompleted: boolean;
    }[];
  }> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const userExists = await this.usersService.userExists(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get all active certifications
    const certifications = await this.mvkCertificationModel
      .find({ isActive: true })
      .exec();

    // Get all requirements from these certifications
    const requirementIds = new Set<string>();
    certifications.forEach((cert) => {
      cert.requirements.forEach((reqId) => {
        requirementIds.add(this.toStringId(reqId));
      });
    });

    // Get progress for all requirements
    const allProgress = await this.userProgressModel
      .find({
        userId,
        requirementId: { $in: Array.from(requirementIds) },
      })
      .exec();

    // Calculate statistics
    const progressMap = new Map<string, UserProgress>();
    allProgress.forEach((progress) => {
      progressMap.set(this.toStringId(progress.requirementId), progress);
    });

    const totalRequirements = requirementIds.size;
    let completedRequirements = 0;
    let inProgressRequirements = 0;
    let notStartedRequirements = 0;
    let totalProgressPercentage = 0;

    requirementIds.forEach((reqId) => {
      const progress = progressMap.get(reqId);

      if (!progress) {
        notStartedRequirements++;
      } else if (progress.status === RequirementStatus.COMPLETED) {
        completedRequirements++;
        totalProgressPercentage += 100;
      } else if (progress.status === RequirementStatus.IN_PROGRESS) {
        inProgressRequirements++;
        totalProgressPercentage += progress.progress;
      } else {
        notStartedRequirements++;
      }
    });

    const overallProgress =
      totalRequirements > 0
        ? Math.round(totalProgressPercentage / totalRequirements)
        : 0;

    // Calculate certification progress
    const certificationsProgress = await Promise.all(
      certifications.map(async (cert) => {
        const userCert = await this.userCertificationModel
          .findOne({
            userId,
            certificationId: cert._id,
          })
          .exec();

        if (userCert) {
          return {
            certificationId: this.toStringId(cert._id),
            title: cert.title,
            progress: userCert.completionPercentage,
            isCompleted: userCert.isCompleted,
          };
        }

        // If no user certification record exists yet, calculate from requirements
        let certCompletedReqs = 0;
        let certTotalProgressPercentage = 0;

        cert.requirements.forEach((reqId) => {
          const reqIdStr = this.toStringId(reqId);
          const progress = progressMap.get(reqIdStr);

          if (progress && progress.status === RequirementStatus.COMPLETED) {
            certCompletedReqs++;
            certTotalProgressPercentage += 100;
          } else if (
            progress &&
            progress.status === RequirementStatus.IN_PROGRESS
          ) {
            certTotalProgressPercentage += progress.progress;
          }
        });

        const certProgress =
          cert.requirements.length > 0
            ? Math.round(certTotalProgressPercentage / cert.requirements.length)
            : 0;

        const isCompleted =
          cert.requirements.length > 0 &&
          certCompletedReqs === cert.requirements.length;

        return {
          certificationId: this.toStringId(cert._id),
          title: cert.title,
          progress: certProgress,
          isCompleted,
        };
      }),
    );

    return {
      totalRequirements,
      completedRequirements,
      inProgressRequirements,
      notStartedRequirements,
      overallProgress,
      certifications: certificationsProgress,
    };
  }

  // Certification Management
  async checkCertificationProgress(userId: string): Promise<void> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // Get all active certifications
    const certifications = await this.mvkCertificationModel
      .find({ isActive: true })
      .exec();

    for (const cert of certifications) {
      // Get all user progress for requirements in this certification
      const requirementIds = cert.requirements.map((r) => this.toStringId(r));
      const userProgress = await this.userProgressModel
        .find({
          userId,
          requirementId: { $in: requirementIds },
        })
        .exec();

      // Calculate completion percentage
      const progressMap = new Map<string, UserProgress>();
      userProgress.forEach((progress) => {
        progressMap.set(this.toStringId(progress.requirementId), progress);
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let completedRequirements = 0;
      let totalProgress = 0;

      requirementIds.forEach((reqId) => {
        const progress = progressMap.get(reqId);

        if (progress && progress.status === RequirementStatus.COMPLETED) {
          completedRequirements++;
          totalProgress += 100;
        } else if (progress) {
          totalProgress += progress.progress;
        }
      });

      const completionPercentage =
        requirementIds.length > 0
          ? Math.round(totalProgress / requirementIds.length)
          : 0;

      const isCompleted =
        completionPercentage >= cert.requiredCompletionPercentage;

      // Update or create user certification record
      let userCert = await this.userCertificationModel
        .findOne({
          userId,
          certificationId: cert._id,
        })
        .exec();

      if (!userCert) {
        userCert = new this.userCertificationModel({
          userId,
          certificationId: cert._id,
          isCompleted: false,
          completionPercentage: 0,
        });
      }

      // Update certification status
      userCert.completionPercentage = completionPercentage;

      if (isCompleted && !userCert.isCompleted) {
        // User just completed the certification
        userCert.isCompleted = true;
        userCert.completedAt = new Date();
        userCert.certificateNumber = `ACE-${randomUUID().substring(0, 8).toUpperCase()}`;

        // If needed, set expiration date (e.g., 2 years from now)
        const twoYearsFromNow = new Date();
        twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
        userCert.expiresAt = twoYearsFromNow;
      } else if (!isCompleted && userCert.isCompleted) {
        // User lost completed status (requirements might have changed)
        userCert.isCompleted = false;
        userCert.completedAt = null;
      }

      await userCert.save();
    }
  }

  async getUserCertifications(userId: string): Promise<UserCertification[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const userExists = await this.usersService.userExists(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.userCertificationModel
      .find({ userId })
      .populate('certificationId')
      .exec();
  }

  async findMVKRequirementsByItemId(
    itemId: string,
    type: string,
  ): Promise<MVKRequirement[]> {
    if (!isValidObjectId(itemId)) {
      throw new BadRequestException('Invalid item ID');
    }

    return this.mvkRequirementModel
      .find({
        itemId,
        type,
      })
      .exec();
  }
}
