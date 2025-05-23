import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { PermitModule } from './permit/permit.module';
import { LearningModule } from './learning/learning.module';
import { MVKModule } from './mvk/mvk.module';
import { AssessmentModule } from './assessment/assessment.module';
import { GamificationModule } from './gamification/gamification.module';
// import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    PermitModule,
    LearningModule,
    MVKModule,
    AssessmentModule,
    GamificationModule,
    // DashboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
