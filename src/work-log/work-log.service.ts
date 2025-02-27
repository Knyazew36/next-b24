import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma.service';
import { IElapsedItem } from './type/elapsedItem.type';
import { LAST_YEAR_ISO_DATE } from 'src/constants';

@Injectable()
export class WorkLogService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async fetchAndSaveElapsedItems(): Promise<void> {
    console.info('fetchAndSaveElapsedItems started');
    const apiUrl = `${this.configService.get('BITRIX_WEBHOOK')}task.elapseditem.getlist`;
    let start = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await lastValueFrom(
        this.httpService.post<{ result: IElapsedItem[] }>(apiUrl, {
          ORDER: {
            CREATED_DATE: 'desc',
          },
          FILTER: {
            '>CREATED_DATE': LAST_YEAR_ISO_DATE(),
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
    console.info('fetchAndSaveElapsedItems End');
  }

  private async saveElapsedItemsBd(data: IElapsedItem[]): Promise<void> {
    for (const item of data) {
      await this.prisma.elapsedItem.upsert({
        where: { bitrixId: item.ID },
        update: {
          minutes: item.MINUTES || '',
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
}
