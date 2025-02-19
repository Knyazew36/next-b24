import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { GetReportDto } from './dto/get-report.dto';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async getReport(@Body() body: GetReportDto) {
    return this.reportService.getReport(body);
  }
}
