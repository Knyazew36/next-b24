import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WorkgroupModule } from './workgroup/workgroup.module';
import { SharedModule } from './shared/shared.module';
import { SonetgroupModule } from './sonetgroup/sonetgroup.module';
import { TaskModule } from './task/task.module';
import { DepartmentModule } from './department/department.module';

@Module({
  imports: [
    UserModule,
    ScheduleModule.forRoot(),
    WorkgroupModule,
    SharedModule,
    SonetgroupModule,
    TaskModule,
    DepartmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
