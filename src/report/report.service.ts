import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport() {
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

    const reportData = users
      .map((user) => {
        if (!user.name) return null;

        const fullName =
          `${user.lastName} ${user.name} ${user.secondName ?? ''}`.trim();

        const report = {};
        // const report = this.generateDailyReport(user.WorkLog);

        return { fullName, report };
      })
      .filter(Boolean);

    return reportData;
  }

  // private generateDailyReport(data: []) {
  //   return data.reduce((acc, task) => {
  //     // Формируем ключ по дате без времени
  //     const dateKey = new Date(task.createdDate).toISOString().split('T')[0];

  //     // Если уже есть этот день в объекте, добавляем туда
  //     if (!acc[dateKey]) {
  //       acc[dateKey] = {
  //         totalMinutes: 0,
  //         tasks: [],
  //       };
  //     }

  //     // // Увеличиваем общее количество минут
  //     // acc[dateKey].totalMinutes += Number(task.minutes);

  //     // // Добавляем объект задачи
  //     // acc[dateKey].tasks.push({
  //     //   bitrixId: task.bitrixId,
  //     //   minutes: task.minutes,
  //     //   createdDate: task.createdDate,
  //     //   task: task.task,
  //     // });
  //     console.log('acc', acc);
  //     return acc;
  //   }, {});
  // }

  private formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0
      ? `${hours}ч ${remainingMinutes}м`
      : `${remainingMinutes}м`;
  }
}
