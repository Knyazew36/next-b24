import { Module } from '@nestjs/common';
import { WorkLogService } from './work-log.service';
import { WorkLogController } from './work-log.controller';

@Module({
  controllers: [WorkLogController],
  providers: [WorkLogService],
  exports: [WorkLogService],
})
export class WorkLogModule {}
