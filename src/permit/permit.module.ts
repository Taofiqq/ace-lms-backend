import { Module } from '@nestjs/common';
import { PermitService } from './permit.service';
import { ConfigModule } from '@nestjs/config';
import { PermitController } from './permit.controller';

@Module({
  imports: [ConfigModule],
  controllers: [PermitController],
  providers: [PermitService],
  exports: [PermitService],
})
export class PermitModule {}
