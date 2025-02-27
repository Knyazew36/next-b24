import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma.service';
import { ISonetGroup } from './type/sonetgroup.type';
import { LAST_YEAR_ISO_DATE } from 'src/constants';

@Injectable()
export class SonetgroupService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  private async fetchAndSaveSonetGroup(): Promise<void> {
    const apiUrl = `${this.configService.get('BITRIX_WEBHOOK')}sonet_group.get`;
    let start = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await lastValueFrom(
        this.httpService.post<{ result: ISonetGroup[] }>(apiUrl, {
          ORDER: { DATE_CREATE: 'DESC' },
          FILTER: { '>DATE_CREATE': LAST_YEAR_ISO_DATE() },
          IS_ADMIN: 'Y',
          start: start,
          limit: 50,
        }),
      );

      if (!response.data?.result) {
        throw new Error('Bitrix API did not return fetchAndSaveSonetGroup');
      }
      const data = response.data.result;
      await this.saveSonetGroupBd(data);
      hasMore = data.length >= 50;

      if (hasMore) start += 50;
    }
  }

  private async saveSonetGroupBd(data: ISonetGroup[]): Promise<void> {
    for (const item of data) {
      await this.prisma.sonetGroup.upsert({
        where: { bitrixId: item.ID.toString() },
        update: {
          title: item.NAME || '',
          bitrixId: item.ID.toString(),
          createdDate: item.DATE_CREATE || '',
          isProject: item.PROJECT === 'Y',
        },
        create: {
          title: item.NAME || '',
          bitrixId: item.ID.toString(),
          createdDate: item.DATE_CREATE || '',
          isProject: item.PROJECT === 'Y',
        },
      });
    }
  }

  async getSonetGroup() {
    try {
      await this.fetchAndSaveSonetGroup();
      return 'done';
    } catch (error) {
      throw new Error(`Error fetching sonetGroup: ${error.message}`);
    }
  }
}
