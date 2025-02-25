import { HttpModule, HttpService } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { SharedService } from './shared.service';

@Global()
@Module({
  providers: [PrismaService, SharedService],
  imports: [ConfigModule.forRoot(), HttpModule],
  exports: [ConfigModule, PrismaService, HttpModule, SharedService],
})
export class SharedModule {}
