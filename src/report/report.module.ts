import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  controllers: [ReportController],
  providers: [ReportService],
  imports: [SharedModule],
})
export class ReportModule {}
