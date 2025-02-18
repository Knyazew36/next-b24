import { Controller, Get, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { UserService } from 'src/user/user.service';

@Controller('task')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly userService: UserService,
  ) {}

  @Get('test')
  async test() {
    await this.userService.fetchAndSaveUsers();
    await this.taskService.getTasks();
    await this.taskService.getElapsedItem();

    return;
  }
  @Post('test')
  async post() {
    return await this.taskService.getTest();
  }
}
