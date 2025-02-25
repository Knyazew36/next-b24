import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SharedService {
  constructor(private readonly prisma: PrismaService) {}

  async createUpdateBitrixBD(date: Date) {
    await this.prisma.service.upsert({
      where: { id: 1 },
      update: { updateBitrixBD: date },
      create: { id: 1, updateBitrixBD: date },
    });
  }
}
