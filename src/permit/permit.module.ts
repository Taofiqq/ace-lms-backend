import { Module } from '@nestjs/common';
import { PermitService } from './permit.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [PermitService],
  exports: [PermitService],
})
export class PermitModule {}
