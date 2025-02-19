import { Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';
import { DepartmentService } from './department/department.service';
import { PrismaService } from './prisma.service';
import { TaskService } from './task/task.service';

@Injectable()
export class AppService {
  constructor(
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
    private readonly taskService: TaskService,

    private readonly prisma: PrismaService,
  ) {}

  async getHello() {
    await this.userService.fetchAndSaveUsers();
    await this.departmentService.getDepartment();
    await this.taskService.getTasks();
    await this.taskService.getElapsedItem();
    return await this.prisma.user.findMany({
      take: 20,
      include: {
        Department: true,
        WorkLog: { include: { task: true } },
        Tasks: true,
      },
    });
  }
}
