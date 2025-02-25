import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { IGetReportBody } from './type/getReport.type';
import * as dayjs from 'dayjs';
import { eachDayOfInterval, format, isWeekend } from 'date-fns';
import { formatMinutesToHours } from 'src/utils';
import { formatDate } from 'src/utils/formatDate';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  private generateDateRangeWithDateFns(startDate: string, endDate: string) {
    console.info('startDate gene', startDate);
    console.info('endDate gene', endDate);
    return eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate),
    }).map((date) => ({
      date: format(date, 'yyyy-MM-dd'),
      month: date.getMonth() + 1,
      isWeekend: isWeekend(date),
    }));
  }

  private generateDateFilters = () => {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    const dateRanges = [
      {
        label: 'Текущий месяц',
        value: `dateStart=${formatDate(new Date(today.getFullYear(), today.getMonth(), 1))}&dateEnd=${formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0))}`,
      },
      {
        label: 'Прошлый месяц',
        value: `dateStart=${formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1))}&dateEnd=${formatDate(new Date(today.getFullYear(), today.getMonth(), 0))}`,
      },
      {
        label: 'Текущая неделя',
        value: (() => {
          const start = new Date(today);
          start.setDate(today.getDate() - today.getDay() + 1);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return `dateStart=${formatDate(start)}&dateEnd=${formatDate(end)}`;
        })(),
      },
      {
        label: 'Прошлая неделя',
        value: (() => {
          const start = new Date(today);
          start.setDate(today.getDate() - today.getDay() - 6);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return `dateStart=${formatDate(start)}&dateEnd=${formatDate(end)}`;
        })(),
      },
    ];

    return dateRanges;
  };

  private getDateUpdateBD = async (): Promise<string> => {
    const record = await this.prisma.service.findUnique({ where: { id: 1 } });
    return `Последнее обновление: ${formatDate(record.updateBitrixBD)}`;
  };

  async getFromBd({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
    const users = await this.prisma.user.findMany({
      orderBy: { departmentIds: 'asc' },
      select: {
        name: true,
        secondName: true,
        lastName: true,
        Department: true,
        avatar: true,
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
                groupBitrixId: true,
                parentTaskId: true,
                SonetGroup: { select: { bitrixId: true, title: true } },
                ParentTask: true,
              },
            },
          },
          where: {
            createdDate: {
              gte: dateFrom,
              lte: dateTo,
            },
          },
        },
      },
    });

    return users;
  }

  async getReport(body: IGetReportBody) {
    const from = body?.dateStart
      ? dayjs(body.dateStart).startOf('day').toISOString()
      : dayjs().subtract(1, 'month').startOf('day').toISOString();

    const to = body?.dateEnd
      ? dayjs(body.dateEnd).endOf('day').toISOString()
      : dayjs().endOf('day').toISOString();

    const users = await this.getFromBd({
      dateFrom: from,
      dateTo: to,
    });

    const groups = await this.prisma.sonetGroup.findMany();

    const reportData = users
      .map((user) => {
        if (!user.name) return null;
        let totalTime = 0;

        const fullName =
          `${user.lastName} ${user.name} ${user.secondName ?? ''}`.trim();
        const newItem = {};
        const department = user.Department;

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

          const targetTask = item.task.ParentTask ?? item.task;
          const taskTitle = targetTask?.title ?? 'Без названия';
          const groupId = targetTask.groupBitrixId;
          // (targetTask?.bitrixId || targetTask?.parentTaskId) ?? 'no-group';

          let group = newItem[dateKey].groups.find(
            (g) => g.groupId === groupId,
          );

          if (!group) {
            group = {
              groupId,
              groupName: groups.find(
                (item) => item.bitrixId === targetTask.groupBitrixId,
              )?.title,
              totalTime: 0,
              tasks: [],
            };
            newItem[dateKey].groups.push(group);
          }

          const task = {
            title: taskTitle,
            time: formatMinutesToHours(+item.minutes),
            taskId: targetTask?.bitrixId ?? '',
            taskLink: `https://cloudmill.bitrix24.ru/workgroups/group/${targetTask.groupBitrixId}/tasks/task/view/${item.task.bitrixId}/`,
          };

          group.tasks.push(task);
          group.totalTime += +item.minutes;
        });

        Object.keys(newItem).forEach((dateKey) => {
          newItem[dateKey].time = formatMinutesToHours(newItem[dateKey].time);
          newItem[dateKey].groups.forEach((group) => {
            group.totalTime = formatMinutesToHours(group.totalTime);
          });
        });

        const formattedTotalTime = formatMinutesToHours(+totalTime);

        return {
          fullName,
          totalTime: formattedTotalTime,
          workLog: newItem,
          department,
          avatar: user.avatar || '',
        };
      })
      .filter(Boolean);

    let filtered = reportData;

    if (body.department) {
      filtered = reportData.filter((user) => {
        return user.department.some(
          (dep) => +dep.bitrixId === +body.department,
        );
      });
    }

    const dateFilters = this.generateDateFilters();
    const dateRange = this.generateDateRangeWithDateFns(from, to);
    const updateDate = await this.getDateUpdateBD();

    return { data: filtered, dateRange, dateFilters, from, to, updateDate };
  }
}
