import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppService } from './app.service';

@Injectable()
export class AppCron {
  constructor(private readonly appService: AppService) {}

  // @Cron('40 * * * * *')
  async getDataFromBD() {
    console.log('getDataFromBD Cron');
    await this.appService.getDataFromBD();
  }
}
