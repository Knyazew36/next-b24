import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma.service';
import { ITask } from './type/task.type';
import { IElapsedItem } from './type/elapsedItem.type';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async getTasks() {
    const apiUrl = `${this.configService.get('BITRIX_DOMAIN')}tasks.task.list`;

    try {
      let start = 0;
      let all: ITask[] = [];
      let hasMore = true;

      while (hasMore) {
        const resUrl = `${apiUrl}?start=${start}`;

        const response = await lastValueFrom(
          this.httpService.post<{ result: { tasks: ITask[] } }>(resUrl, {
            filter: {
              '>CREATED_DATE': '2025-01-01T00:00:00Z',
            },
            select: ['ID', 'TITLE', 'GROUP_ID', 'GROUP', 'DESCRIPTION'],
          }),
        );
        if (!response.data?.result) {
          throw new Error('Bitrix API did not return tasks');
        }

        const arr = response.data.result.tasks;
        all = [...all, ...arr];

        if (arr.length < 50) {
          hasMore = false;
        } else {
          start += 50;
        }
      }

      await Promise.all(
        all.map((task) =>
          this.prisma.task.upsert({
            where: { bitrixId: task.id },
            update: {
              title: task.title || '',
              description: task.description || '',
            },
            create: {
              title: task.title || '',
              bitrixId: task.id,
              createdDate: task.createdDate || '',
              description: task.description || '',
            },
          }),
        ),
      );

      return 'done';
    } catch (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }
  }

  async getElapsedItem() {
    const apiUrl = `${this.configService.get('BITRIX_DOMAIN')}task.elapseditem.getlist`;

    try {
      let start = 1;
      let all: IElapsedItem[] = [];
      let hasMore = true;

      while (hasMore) {
        const response = await lastValueFrom(
          this.httpService.post<{ result: IElapsedItem[] }>(apiUrl, {
            ORDER: {},
            FILTER: {
              '>CREATED_DATE': '2025-01-01T00:00:00Z',
            },
            SELECT: [],
            PARAMS: {
              NAV_PARAMS: {
                iNumPage: start,
              },
            },
          }),
        );

        if (!response.data?.result) {
          throw new Error(`Bitrix API did not return tasks`);
        }

        const arr = response.data.result;
        all = [...all, ...arr];

        if (arr.length < 50) {
          hasMore = false;
        } else {
          start += 1;
        }
      }

      await Promise.all(
        all.map((item) =>
          this.prisma.elapsedItem.upsert({
            where: { bitrixId: item.ID },
            update: {
              minutes: item.MINUTES || '',
            },
            create: {
              bitrixId: item.ID,
              minutes: item.MINUTES || '',
              createdDate: item.CREATED_DATE,

              user: {
                connectOrCreate: {
                  where: { bitrixId: item.USER_ID },
                  create: {
                    bitrixId: item.USER_ID,
                    name: '',
                  },
                },
              },
              // task: {
              //   connectOrCreate: {
              //     where: { bitrixId: item.TASK_ID },
              //     create: {
              //       bitrixId: item.TASK_ID,
              //     },
              //   },
              // },
            },
          }),
        ),
      );
    } catch (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }
  }

  async getTest() {
    return await this.prisma.user.findMany({
      include: { Tasks: true, WorkLog: true },
    });
  }
}
