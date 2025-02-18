import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [TaskController],
  providers: [TaskService, UserService],
  imports: [UserModule],
})
export class TaskModule {}
