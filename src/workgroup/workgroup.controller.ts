import { Controller } from '@nestjs/common';
import { WorkgroupService } from './workgroup.service';

@Controller('workgroup')
export class WorkgroupController {
  constructor(private readonly workgroupService: WorkgroupService) {}
}
