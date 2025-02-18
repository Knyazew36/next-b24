import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { UserCron } from './user.cron';

@Module({
  controllers: [UserController],
  providers: [UserService, UserCron],
  imports: [ScheduleModule],
})
export class UserModule {}
