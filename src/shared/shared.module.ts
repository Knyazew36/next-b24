import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  imports: [ConfigModule.forRoot()],
  exports: [ConfigModule, PrismaService],
})
export class SharedModule {}
