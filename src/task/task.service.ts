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
      await this.saveTasksBd(tasks);

      hasMore = tasks.length >= 50;
      if (hasMore) start += 50;
    }
  }

  private async saveTasksBd(data: ITask[]): Promise<void> {
    for (const task of data) {
      await this.prisma.task.upsert({
        where: { bitrixId: task.id },
        update: {
          title: task.title || '',
          bitrixId: task.id,
          createdDate: task.createdDate || '',
          description: task.description || '',
          groupBitrixId: task.groupId || '',
          SonetGroup: {
            connectOrCreate: {
              where: { bitrixId: task.groupId || '' },
              create: {
                bitrixId: task.groupId,
              },
            },
          },
        },

        create: {
          title: task.title || '',
          bitrixId: task.id,
          createdDate: task.createdDate || '',
          description: task.description || '',
          groupBitrixId: task.groupId || '',
          SonetGroup: {
            connectOrCreate: {
              where: { bitrixId: task.groupId || '' },
              create: {
                bitrixId: task.groupId,
              },
            },
          },
        },
      });
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
      const response = await lastValueFrom(
        this.httpService.post<{ result: IElapsedItem[] }>(apiUrl, {
          ORDER: {
            CREATED_DATE: 'desc',
          },
          FILTER: {
            '>CREATED_DATE': '2024-11-10T13:51:09+03:00',
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
      await this.saveElapsedItemsBd(elapsedItems);

      hasMore = elapsedItems.length >= 50;
      if (hasMore) start += 1;
    }
  }

  private async saveElapsedItemsBd(data: IElapsedItem[]): Promise<void> {
    for (const item of data) {
      await this.prisma.elapsedItem.upsert({
        where: { bitrixId: item.ID },
        update: {
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
  }

  async getElapsedItem() {
    try {
      await this.fetchAndSaveElapsedItems();
      return 'done';
    } catch (error) {
      throw new Error(`Error fetching elapsed items: ${error.message}`);
    }
  }
}
