import { Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';
import { DepartmentService } from './department/department.service';
import { PrismaService } from './prisma.service';
import { TaskService } from './task/task.service';
import { SonetgroupService } from './sonetgroup/sonetgroup.service';
import { WorkLogService } from './work-log/work-log.service';

@Injectable()
export class AppService {
  constructor(
    private readonly userService: UserService,
    private readonly departmentService: DepartmentService,
    private readonly taskService: TaskService,
    private readonly sonetGroupServie: SonetgroupService,
    private readonly prisma: PrismaService,
    private readonly workLogService: WorkLogService,
  ) {}

  async getDataFromBD() {
    await this.prisma.elapsedItem.deleteMany({});
    await this.prisma.task.deleteMany({});
    await this.prisma.user.deleteMany({});
    await this.prisma.department.deleteMany({});
    await this.prisma.sonetGroup.deleteMany({});
    console.log('reset done');
    await this.userService.fetchAndSaveUsers();
    await this.departmentService.getDepartmentFromBitrix();
    await this.sonetGroupServie.getSonetGroup();
    await this.taskService.getTasks();
    await this.workLogService.fetchAndSaveElapsedItems();
    return 'getDataFromBD Done';
  }

  async test() {
    return await this.prisma.user.findFirst({
      where: { lastName: 'Князев' },
      include: {
        Department: true,
        WorkLog: {
          include: {
            task: {
              include: {
                SonetGroup: { select: { title: true } },
                ParentTask: true,
              },
            },
          },
        },
      },
    });
  }
}
