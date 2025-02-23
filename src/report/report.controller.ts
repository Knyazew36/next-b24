import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ReportService } from './report.service';
import { IGetReportBody } from './type/getReport.type';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async getReport(@Body() body: IGetReportBody) {
    return this.reportService.getReport(body);
  }
}
