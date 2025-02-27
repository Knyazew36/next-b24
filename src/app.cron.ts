import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppService } from './app.service';

@Injectable()
export class AppCron {
  constructor(private readonly appService: AppService) {}

  @Cron('0 * * * *')
  async getDataFromBD() {
    await this.appService.getDataFromBD();
  }
}
