import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ReportService } from './report.service';
import { GetReportDto } from './dto/get-report.dto';
import { IGetReportBody } from './type/getReport.type';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async getReport(@Body() body: IGetReportBody) {
    return this.reportService.getReport(body);
  }
  // @Get()
  // async getTestBd() {
  //   return this.reportService.getFromBd({});
  // }
}
