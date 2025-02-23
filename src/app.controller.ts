import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getDataFromBD() {
    return this.appService.getDataFromBD();
  }

  @Post()
  test() {
    return this.appService.test();
  }
}
