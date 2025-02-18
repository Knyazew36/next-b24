import { HttpModule, HttpService } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  imports: [ConfigModule.forRoot(), HttpModule],
  exports: [ConfigModule, PrismaService, HttpModule],
})
export class SharedModule {}
