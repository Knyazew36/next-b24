import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [ScheduleModule],
})
export class UserModule {}
