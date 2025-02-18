import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from './type/user.type';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async fetchAndSaveUsers() {
    const apiUrl = `${this.configService.get('BITRIX_DOMAIN')}user.get?ADMIN_MODE=true`;
    try {
      let start = 0;
      let allUsers: IUser[] = [];
      let hasMore = true;

      while (hasMore) {
        const restUrl = `${apiUrl}&start=${start}`;
        const response = await lastValueFrom(
          this.httpService.get<{ result: IUser[] }>(restUrl),
        );

        if (!response.data?.result) {
          throw new Error('Bitrix API did not return users');
        }

        const users = response.data.result;
        allUsers = [...allUsers, ...users];

        if (users.length < 50) {
          hasMore = false;
        } else {
          start += 50;
        }
      }

      if (allUsers.length === 0) {
        return [];
      }

      const formatUsers = this.extractUserFields(allUsers);

      await this.prisma.user.createMany({
        data: formatUsers,
        skipDuplicates: true,
      });

      return formatUsers;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  extractUserFields(userData: IUser[]) {
    return userData.map((user) => ({
      name: user.NAME || '',
      lastName: user.LAST_NAME || '',
      secondName: user.SECOND_NAME || null,
      birthDate: user.PERSONAL_BIRTHDAY || null,
      email: user.EMAIL || null,
      mobile: user.PERSONAL_MOBILE || null,
      photo: user.PERSONAL_PHOTO || null,
      workPosition: user.WORK_POSITION || null,
      bitrixId: user.ID,
    }));
  }
}
