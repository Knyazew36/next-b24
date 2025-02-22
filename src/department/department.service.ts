import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from 'src/prisma.service';
import { IDepartment } from './type/department.type';
import { SelectOption } from 'src/type/select-option.type';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async getDepartmentFromBitrix() {
    const apiUrl = `${this.configService.get('BITRIX_DOMAIN')}department.get`;

    try {
      let start = 0;
      let all: IDepartment[] = [];
      let hasMore = true;

      while (hasMore) {
        const resUrl = `${apiUrl}`;

        const response = await lastValueFrom(
          this.httpService.post<{ result: IDepartment[] }>(resUrl, {
            START: start,
          }),
        );

        if (!response.data?.result) {
          throw new Error('Bitrix API did not return departments');
        }

        const arr = response.data.result;
        all = [...all, ...arr];

        if (arr.length < 50) {
          hasMore = false;
        } else {
          start += 50;
        }
      }

      const departments = all.map((item) => ({
        bitrixId: item.ID, // Приведение к числу
        name: item.NAME || '',
        sort: item.SORT ? +item.SORT : null,
        parent: item.PARENT ? item.PARENT : null,
      }));

      await this.prisma.department.createMany({
        data: departments,
        skipDuplicates: true,
      });

      const users = await this.prisma.user.findMany();

      for (const user of users) {
        if (!Array.isArray(user.departmentIds)) {
          continue;
        }

        const userDepartment = departments.find((dep) =>
          user.departmentIds.includes(dep.bitrixId),
        );

        if (userDepartment) {
          await this.prisma.user.update({
            where: { bitrixId: user.bitrixId },
            data: {
              Department: { connect: { bitrixId: userDepartment.bitrixId } },
            }, // Не затираем данные
          });
        }
      }

      return departments;
    } catch (error) {
      throw new Error(`Error fetching departments: ${error.message}`);
    }
  }

  async getDepartment() {
    const department = await this.prisma.department.findMany({
      select: { name: true, bitrixId: true },
    });

    const formattedDepartment: SelectOption[] = department.map((item) => ({
      label: item.name,
      value: item.bitrixId,
    }));

    return formattedDepartment;
  }
}
