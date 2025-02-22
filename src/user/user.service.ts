import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from './type/user.type';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async fetchAndSaveUsers() {
    const apiUrl = `${this.configService.get('BITRIX_DOMAIN')}user.get`;

    try {
      let start = 0;
      let hasMore = true;

      while (hasMore) {
        const restUrl = `${apiUrl}?start=${start}`;
        const response = await lastValueFrom(
          this.httpService.post<{ result: IUser[] }>(restUrl, {
            FILTER: {
              USER_TYPE: 'employee',
              ACTIVE: true,
            },
          }),
        );

        if (!response.data?.result) {
          throw new Error('Bitrix API did not return users');
        }

        const users = response.data.result;

        if (users.length === 0) {
          break;
        }

        const formatUsers = this.extractUserFields(users);
        await this.saveUsers(formatUsers);

        if (users.length < 50) {
          hasMore = false;
        } else {
          start += 50;
        }
      }
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  async saveUsers(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[]) {
    await this.prisma.user.createMany({
      data: data,
      skipDuplicates: true,
    });
  }

  async findAll() {
    return await this.prisma.user.findMany({ include: { Tasks: true } });
  }

  async findOne(id: number) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  extractUserFields(
    userData: IUser[],
  ): Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] {
    return userData.map((user) => ({
      name: user.NAME || '',
      lastName: user.LAST_NAME || '',
      secondName: user.SECOND_NAME || null,
      avatar: user.PERSONAL_PHOTO || null,
      workPosition: user.WORK_POSITION || null,
      bitrixId: user.ID,
      departmentIds: Array.isArray(user.UF_DEPARTMENT)
        ? user.UF_DEPARTMENT.map((item) => item.toString())
        : null,
    }));
  }
}
