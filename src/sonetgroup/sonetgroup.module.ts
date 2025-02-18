import { Module } from '@nestjs/common';
import { SonetgroupService } from './sonetgroup.service';
import { SonetgroupController } from './sonetgroup.controller';

@Module({
  controllers: [SonetgroupController],
  providers: [SonetgroupService],
})
export class SonetgroupModule {}
