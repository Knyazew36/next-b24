import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { IGetReportBody } from './type/getReport.type';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getFromBd() {
    const users = await this.prisma.user.findMany({
      select: {
        name: true,
        secondName: true,
        lastName: true,
        WorkLog: {
          orderBy: { createdDate: 'desc' },
          select: {
            bitrixId: true,
            minutes: true,
            createdDate: true,
            task: {
              select: {
                title: true,
                bitrixId: true,
                SonetGroup: { select: { bitrixId: true, title: true } },
                groupBitrixId: true,
              },
            },
          },
          where: {
            createdDate: {
              gte: '2024-11-01T00:00:00.000Z',
              lte: '2025-01-31T23:59:59.999Z',
            },
          },
        },
      },
    });

    return users;
  }

  async getReport(body: IGetReportBody) {
    console.log('body', body);

    const users = await this.getFromBd();
    const reportData = users
      .map((user) => {
        if (!user.name) return null;
        let totalTime = 0;

        const fullName =
          `${user.lastName} ${user.name} ${user.secondName ?? ''}`.trim();

        const newItem = {};

        user.WorkLog.forEach((item) => {
          const dateKey = new Date(item.createdDate)
            .toISOString()
            .split('T')[0];
          const minutes = parseInt(item.minutes, 10) || 0;

          if (!newItem[dateKey]) {
            newItem[dateKey] = { time: 0, groups: [] };
          }

          newItem[dateKey].time += minutes;
          totalTime += minutes;

          const groupId = item.task.SonetGroup?.bitrixId ?? 'no-group';
          const groupName = item.task.SonetGroup?.title ?? 'Без группы';

          // Проверяем, существует ли уже эта группа в массиве
          let group = newItem[dateKey].groups.find(
            (g) => g.groupId === groupId,
          );

          if (!group) {
            group = { groupId, groupName, tasks: [] };
            newItem[dateKey].groups.push(group);
          }

          group.tasks.push({
            title: item.task.title,
            time: item.minutes,
            taskId: item.bitrixId ?? '',
            taskLink: `https://cloudmill.bitrix24.ru/workgroups/group/${item.task.groupBitrixId}/tasks/task/view/${item.bitrixId}/`,
          });
        });

        return { fullName, totalTime, workLog: newItem };
      })
      .filter(Boolean);

    return reportData;
  }

  private formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours}ч ${remainingMinutes}м`
      : `${remainingMinutes}м`;
  }
}
