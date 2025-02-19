import { Body, Injectable } from '@nestjs/common';
import { endOfDay, endOfMonth, startOfDay, subDays, subMonths } from 'date-fns';
import { PrismaService } from 'src/prisma.service';
import { GetReportDto } from './dto/get-report.dto';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(@Body() body: GetReportDto) {
    const departmentId = (() => {
      if (!body?.filter?.departament) return undefined;
      const departmentMap = {
        front: '68',
        back: '70',
      };
      return departmentMap[body.filter.departament];
    })();

    const startDate = new Date('2024-11-01T00:00:00.000Z');
    const endDate = new Date('2025-01-31T23:59:59.999Z');

    const whereCondition: any = {
      createdDate: { gte: startDate, lte: endDate },
    };

    if (departmentId) {
      whereCondition.AND = {
        user: { Department: { some: { bitrixId: departmentId } } },
      };
    }

    const workLogs = await this.prisma.elapsedItem.findMany({
      take: 100,
      where: whereCondition,
      select: {
        user: {
          select: {
            bitrixId: true,
            name: true,
            lastName: true,
            secondName: true,
          },
        },

        task: {
          select: {
            title: true,
            User: { select: { name: true, bitrixId: true } },
          },
        },

        createdDate: true,
        minutes: true,
      },
    });

    const report = {};

    workLogs.forEach(({ user, createdDate, minutes, task }) => {
      if (!user) return;

      const userName = `${user.lastName || ''} ${user.name}`.trim();
      const dateKey = createdDate.toISOString().split('T')[0];

      if (!report[userName]) {
        report[userName] = {
          times: {},
          works: {},
          total: 0,
        };
      }

      if (!report[userName].times[dateKey]) {
        report[userName].times[dateKey] = 0;
      }

      report[userName].times[dateKey] += parseInt(minutes || '0', 10);
      report[userName].total += parseInt(minutes || '0', 10);
    });

    return report;
  }
}
