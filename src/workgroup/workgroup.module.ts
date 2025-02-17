import { Module } from '@nestjs/common';
import { WorkgroupService } from './workgroup.service';
import { WorkgroupController } from './workgroup.controller';

@Module({
  controllers: [WorkgroupController],
  providers: [WorkgroupService],
})
export class WorkgroupModule {}
