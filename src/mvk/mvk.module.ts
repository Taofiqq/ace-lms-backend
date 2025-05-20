import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MVKRequirement,
  MVKRequirementSchema,
} from './schemas/mvk-requirement.schema';
import {
  MVKCertification,
  MVKCertificationSchema,
} from './schemas/mvk-certification.schema';
import {
  UserProgress,
  UserProgressSchema,
} from './schemas/user-progress.schema';
import {
  UserCertification,
  UserCertificationSchema,
} from './schemas/user-certification.schema';
import { MVKService } from './mvk.service';
import { MVKController } from './mvk.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MVKRequirement.name, schema: MVKRequirementSchema },
      { name: MVKCertification.name, schema: MVKCertificationSchema },
      { name: UserProgress.name, schema: UserProgressSchema },
      { name: UserCertification.name, schema: UserCertificationSchema },
    ]),
    UsersModule,
  ],
  controllers: [MVKController],
  providers: [MVKService],
  exports: [MVKService],
})
export class MVKModule {}
