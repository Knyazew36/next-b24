import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkgroupModule } from './workgroup/workgroup.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    UserModule,
    ScheduleModule.forRoot(),
    WorkgroupModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
