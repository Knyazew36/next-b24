import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma.service';
import { ITask } from './type/task.type';
import { LAST_YEAR_ISO_DATE } from 'src/constants';

interface TaskWithParentTask {
  parentId: string;
  taskId: string;
}

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  private taskWithParentTask: TaskWithParentTask[] = [];

  private async fetchAndSaveTasks(): Promise<void> {
    const apiUrl = `${this.configService.get('BITRIX_WEBHOOK')}tasks.task.list`;
    let start = 0;
    let hasMore = true;

    while (hasMore) {
      const resUrl = `${apiUrl}?start=${start}`;

      const response = await lastValueFrom(
        this.httpService.post<{ result: { tasks: ITask[] } }>(resUrl, {
          filter: {
            '>CREATED_DATE': LAST_YEAR_ISO_DATE(),
          },
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
    await this.linkTaskToTask(this.taskWithParentTask);
  }

  private async saveTasksBd(data: ITask[]): Promise<void> {
    for (const task of data) {
      if (task.parentId && +task.parentId !== 0) {
        this.taskWithParentTask.push({
          parentId: task.parentId.toString(),
          taskId: task.id.toString(),
        });
      }

      await this.prisma.task.upsert({
        where: {
          bitrixId: task.id,
        },
        update: {
          title: task.title || '',
          description: task.description || '',
          groupBitrixId: task.groupId || '',
          bitrixParentTaskId: task.parentId || null,
          SonetGroup: {
            connectOrCreate: {
              where: { bitrixId: task.groupId },
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
          bitrixParentTaskId: task.parentId || null,
          SonetGroup: {
            connectOrCreate: {
              where: { bitrixId: task.groupId },
              create: {
                bitrixId: task.groupId,
              },
            },
          },
        },
      });
    }
  }

  private async linkTaskToTask(data: TaskWithParentTask[]): Promise<void> {
    console.info('linkTaskToTask start');

    const updatePromises = data.map(async (item) => {
      // Проверяем существование основной задачи
      const existingTask = await this.prisma.task.findUnique({
        where: { bitrixId: item.taskId },
        select: { id: true }, // Достаточно ID
      });

      if (!existingTask) {
        console.warn(
          `Task with bitrixId ${item.taskId} not found, skipping update.`,
        );
        return;
      }

      // Проверяем существование родительской задачи
      const parentTask = await this.prisma.task.findUnique({
        where: { bitrixId: item.parentId },
        select: { id: true },
      });

      if (!parentTask) {
        console.warn(
          `Parent Task with bitrixId ${item.parentId} not found, skipping.`,
        );
        return;
      }

      // Обновляем задачу, если обе существуют
      return this.prisma.task.update({
        where: { bitrixId: item.taskId },
        data: {
          ParentTask: {
            connect: { bitrixId: item.parentId },
          },
        },
      });
    });

    await Promise.all(updatePromises); // Выполняем все обновления параллельно

    console.info('linkTaskToTask end');
  }

  async getTasks() {
    try {
      await this.fetchAndSaveTasks();
      return 'done';
    } catch (error) {
      throw new Error(`Error fetching tasks: ${error.message}`);
    }
  }
}
