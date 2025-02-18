import { Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class UserCron {
  constructor(private readonly userService: UserService) {}

  @Cron('45 * * * * *')
  async updateUsers() {
    // await this.userService.fetchAndSaveUsers();
  }
}
