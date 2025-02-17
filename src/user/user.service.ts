import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from './type/user.type';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async fetchAndSaveUsers() {
    const apiUrl = `${this.configService.get('BITRIX_DOMAIN')}user.get?ADMIN_MODE=true&USER_TYPE=employee&ACTIVE=true`;
    try {
      const response = await lastValueFrom(
        this.httpService.get<{ result: IUser[] }>(apiUrl),
      );

      const users = this.extractUserFields(response.data.result);

      return users;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  extractUserFields(userData: IUser[]) {
    const users: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    userData.forEach((user) => {
      users.push({
        name: user.NAME,
        lastName: user.LAST_NAME,
        secondName: user.SECOND_NAME,
        birthDate: user.PERSONAL_BIRTHDAY,
        externalId: user.ID,
        email: user.EMAIL,
        mobile: user.PERSONAL_MOBILE,
        photo: user.PERSONAL_PHOTO,
        workPosition: user.WORK_POSITION,
      });
    });

    return users;
  }
}
