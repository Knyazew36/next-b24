import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SonetgroupService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  // async fetchAndSaveUsers() {
  //   const apiUrl = `${this.configService.get('BITRIX_DOMAIN')}sonet_group.get`;

  //   try {
  //     let start = 0;
  //     let all: ISonetGroup[] = [];
  //     let hasMore = true;

  //     while (hasMore) {
  //       const restUrl = `${apiUrl}?start=${start}`;
  //       const response = await lastValueFrom(
  //         this.httpService.get<{ result: ISonetGroup[] }>(restUrl),
  //       );

  //       if (!response.data?.result) {
  //         throw new Error('Bitrix API did not return sonet_group.get');
  //       }

  //       const { result } = response.data;
  //       all = [...all, ...result];

  //       if (result.length < 50) {
  //         hasMore = false;
  //       } else {
  //         start += 50;
  //       }
  //     }

  //     if (all.length === 0) {
  //       return [];
  //     }

  //     const formatUsers = this.extractUserFields(all);
  //     await this.saveUsers(formatUsers);

  //     return formatUsers;
  //   } catch (error) {
  //     throw new Error(`Error fetching users: ${error.message}`);
  //   }
  // }

  // async saveUsers(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[]) {
  //   await this.prisma.user.createMany({
  //     data: data,
  //     skipDuplicates: true,
  //   });
  // }

  // async findAll() {
  //   return await this.prisma.user.findMany();
  // }

  // extractUserFields(
  //   userData: IUser[],
  // ): Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] {
  //   return userData.map((user) => ({
  //     name: user.NAME || '',
  //     lastName: user.LAST_NAME || '',
  //     secondName: user.SECOND_NAME || null,

  //     workPosition: user.WORK_POSITION || null,
  //     bitrixId: user.ID,
  //     departmentIds: Array.isArray(user.UF_DEPARTMENT)
  //       ? user.UF_DEPARTMENT.map((item) => item.toString())
  //       : null,
  //   }));
  // }
}
