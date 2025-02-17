import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [ConfigModule, HttpModule],
})
export class UserModule {}
