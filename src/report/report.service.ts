import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { IGetReportBody } from './type/getReport.type';
import * as dayjs from 'dayjs';
import { eachDayOfInterval, format, isWeekend } from 'date-fns';
import { formatMinutesToHours } from 'src/utils';

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

  async getFromBd({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
    console.log('datafrom', dateFrom);
    const users = await this.prisma.user.findMany({
      orderBy: { departmentIds: 'asc' },

      select: {
        name: true,
        secondName: true,
        lastName: true,
        Department: true,
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
    console.log('body', body);
    const from = body?.dateStart
      ? dayjs(body.dateStart).startOf('day').toISOString()
      : dayjs().subtract(1, 'month').startOf('day').toISOString();

    const to = body?.dateEnd
      ? dayjs(body.dateEnd).endOf('day').toISOString()
      : dayjs().endOf('day').toISOString();

    const dateRange = this.generateDateRangeWithDateFns(from, to);

    const users = await this.getFromBd({
      dateFrom: from,
      dateTo: to,
    });
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

          const groupId = item.task.SonetGroup?.bitrixId ?? 'no-group';
          const groupName = item.task.SonetGroup?.title ?? 'Без группы';

          let group = newItem[dateKey].groups.find(
            (g) => g.groupId === groupId,
          );

          if (!group) {
            group = { groupId, groupName, tasks: [] };
            newItem[dateKey].groups.push(group);
          }

          group.tasks.push({
            title: item.task.title,
            time: formatMinutesToHours(+item.minutes),
            taskId: item.bitrixId ?? '',
            taskLink: `https://cloudmill.bitrix24.ru/workgroups/group/${item.task.groupBitrixId}/tasks/task/view/${item.bitrixId}/`,
          });
        });

        // Форматируем time после вычисления общего времени за день
        Object.keys(newItem).forEach((dateKey) => {
          newItem[dateKey].time = formatMinutesToHours(newItem[dateKey].time);
        });

        const formattedTotalTime = formatMinutesToHours(totalTime);

        return {
          fullName,
          totalTime: formattedTotalTime,
          workLog: newItem,
          department,
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

    return { data: filtered, dateRange, from, to };
  }
}
