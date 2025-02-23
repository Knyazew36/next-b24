import { Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';
import { DepartmentService } from './department/department.service';
import { PrismaService } from './prisma.service';
import { TaskService } from './task/task.service';
import { SonetgroupService } from './sonetgroup/sonetgroup.service';

@Injectable()
export class AppService {
  constructor(
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
    private readonly taskService: TaskService,
    private readonly sonetGroupServie: SonetgroupService,
    private readonly prisma: PrismaService,
  ) {}

  async getDataFromBD() {
    await this.userService.fetchAndSaveUsers();
    await this.departmentService.getDepartmentFromBitrix();
    await this.sonetGroupServie.getSonetGroup();
    await this.taskService.getTasks();
    await this.taskService.getElapsedItem();
    return 'getDataFromBD Done';
  }

  async test() {
    return await this.prisma.user.findMany({
      take: 10,
      include: {
        Department: true,
        WorkLog: {
          include: {
            task: { include: { SonetGroup: { select: { title: true } } } },
          },
        },
      },
    });
  }
}
