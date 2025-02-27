import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { IGetReportBody } from './type/getReport.type';
import * as dayjs from 'dayjs';
import { eachDayOfInterval, format, isWeekend } from 'date-fns';
import { formatMinutesToHours } from 'src/utils';
import { SharedService } from 'src/shared/shared.service';
import { ConfigService } from '@nestjs/config';
import { ru } from 'date-fns/locale';
@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sharedService: SharedService,
    private readonly configService: ConfigService,
  ) {}

  async getFromBd({ dateFrom, dateTo }: { dateFrom: string; dateTo: string }) {
    console.info('dateFrom', dateFrom);
    console.info('dateTo', dateTo);

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
            comment: true,
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
    if (!(await this.checkStatusBd())) return { statusBD: 'loading' };

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
            taskLink: `${this.configService.get('BITRIX_DOMAIN')}/workgroups/group/${targetTask.groupBitrixId}/tasks/task/view/${item.task.bitrixId}/`,
            comment: item.comment ?? '',
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

  private async checkStatusBd() {
    const record = await this.prisma.service.findUnique({ where: { id: 1 } });
    console.log('checkStatusBd record.statusBD', record.statusBD);
    return record.statusBD === 'ready';
  }

  private generateDateRangeWithDateFns(startDate: string, endDate: string) {
    return eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate),
    }).map((date) => ({
      date: format(date, 'yyyy-MM-dd'),
      formattedDate: format(date, 'd MMM', { locale: ru }), // Добавлено поле с форматом "27 янв"
      month: date.getMonth() + 1,
      isWeekend: isWeekend(date),
    }));
  }

  private generateDateFilters = () => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Получаем первый и последний день текущего месяца
    const firstDayCurrentMonth = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), 1),
    );

    const lastDayCurrentMonth = new Date(
      Date.UTC(today.getFullYear(), today.getMonth() + 1, 0),
    );

    // Вычисляем первый и последний день прошлого месяца
    const firstDayPrevMonth = new Date(
      Date.UTC(today.getFullYear(), today.getMonth() - 1, 1),
    );
    const lastDayPrevMonth = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), 0),
    ); // 0-й день текущего месяца = последний день прошлого

    // Вычисляем текущую неделю (понедельник - воскресенье)
    const startCurrentWeek = new Date(today);
    startCurrentWeek.setDate(today.getDate() - today.getDay() + 1); // Первый день недели (понедельник)
    const endCurrentWeek = new Date(startCurrentWeek);
    endCurrentWeek.setDate(startCurrentWeek.getDate() + 6); // Последний день недели (воскресенье)

    // Вычисляем прошлую неделю (понедельник - воскресенье)
    const startPrevWeek = new Date(startCurrentWeek);
    startPrevWeek.setDate(startCurrentWeek.getDate() - 7);
    const endPrevWeek = new Date(startPrevWeek);
    endPrevWeek.setDate(startPrevWeek.getDate() + 6);

    return [
      {
        label: 'Текущий месяц',
        value: `dateStart=${formatDate(firstDayCurrentMonth)}&dateEnd=${formatDate(lastDayCurrentMonth)}`,
      },
      {
        label: 'Прошлый месяц',
        value: `dateStart=${formatDate(firstDayPrevMonth)}&dateEnd=${formatDate(lastDayPrevMonth)}`,
      },
      {
        label: 'Текущая неделя',
        value: `dateStart=${formatDate(startCurrentWeek)}&dateEnd=${formatDate(endCurrentWeek)}`,
      },
      {
        label: 'Прошлая неделя',
        value: `dateStart=${formatDate(startPrevWeek)}&dateEnd=${formatDate(endPrevWeek)}`,
      },
    ];
  };

  private getDateUpdateBD = async (): Promise<string> => {
    const record = await this.prisma.service.findUnique({ where: { id: 1 } });

    return `Последнее обновление: ${format(record.lastUpdateBitrixBD, 'd MMM HH:mm', { locale: ru })}`;
  };
}
