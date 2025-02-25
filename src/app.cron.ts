import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AppService } from './app.service';
import { SharedService } from './shared/shared.service';

@Injectable()
export class AppCron {
  constructor(
    private readonly appService: AppService,
    private readonly sharedService: SharedService,
  ) {}

  @Cron('*/2 * * * *')
  async getDataFromBD() {
    this.sharedService.createUpdateBitrixBD(new Date());
    await this.appService.getDataFromBD();
  }
}
