import { Controller } from '@nestjs/common';
import { SonetgroupService } from './sonetgroup.service';

@Controller('sonetgroup')
export class SonetgroupController {
  constructor(private readonly sonetgroupService: SonetgroupService) {}
}
