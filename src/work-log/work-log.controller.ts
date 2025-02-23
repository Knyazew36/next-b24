import { Controller } from '@nestjs/common';
import { WorkLogService } from './work-log.service';

@Controller('work-log')
export class WorkLogController {
  constructor(private readonly workLogService: WorkLogService) {}
}
