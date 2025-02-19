import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma.service';
import { ITask } from './type/task.type';
import { IElapsedItem } from './type/elapsedItem.type';
import { LAST_YEAR_ISO_DATE } from 'src/constants';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  private async fetchAndSaveTasks(): Promise<void> {
    const apiUrl = `${this.configService.get('BITRIX_DOMAIN')}tasks.task.list`;
    let start = 0;
    let hasMore = true;

    while (hasMore) {
      const resUrl = `${apiUrl}?start=${start}`;

      const response = await lastValueFrom(
        this.httpService.post<{ result: { tasks: ITask[] } }>(resUrl, {
          filter: {
            '>CREATED_DATE': '2024-07-10T13:51:09+03:00',
          },
          select: ['ID', 'TITLE', 'GROUP_ID', 'GROUP', 'DESCRIPTION'],
        }),
      );

      if (!response.data?.result) {
        throw new Error('Bitrix API did not return tasks');
      }

      const tasks = response.data.result.tasks;
      for (const task of tasks) {
        await this.prisma.task.upsert({
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
        });
      }

      hasMore = tasks.length >= 50;
      if (hasMore) start += 50;
    }
  }

  async getTasks() {
    try {
      await this.fetchAndSaveTasks();
      return 'done';
    } catch (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }
  }

  private async fetchAndSaveElapsedItems(): Promise<void> {
    const apiUrl = `${this.configService.get('BITRIX_DOMAIN')}task.elapseditem.getlist`;
    let start = 1;
    let hasMore = true;

    while (hasMore) {
      console.log('start', start);
      const response = await lastValueFrom(
        this.httpService.post<{ result: IElapsedItem[] }>(apiUrl, {
          ORDER: {
            CREATED_DATE: 'desc',
          },
          FILTER: {
            '>CREATED_DATE': '2024-07-10T13:51:09+03:00',
            // CREATED_DATE: LAST_YEAR_ISO_DATE(),
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
        throw new Error(`Bitrix API did not return elapsed items`);
      }

      const elapsedItems = response.data.result;
      for (const item of elapsedItems) {
        await this.prisma.elapsedItem.upsert({
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
            task: {
              connectOrCreate: {
                where: { bitrixId: item.TASK_ID },
                create: {
                  bitrixId: item.TASK_ID,
                },
              },
            },
          },
        });
      }

      hasMore = elapsedItems.length >= 50;
      if (hasMore) start += 1;
    }
  }

  async getElapsedItem() {
    try {
      const res = await this.fetchAndSaveElapsedItems();

      console.log('res', res);
      // return 'done';
    } catch (error) {
      throw new Error(`Error fetching elapsed items: ${error.message}`);
    }
  }
}
