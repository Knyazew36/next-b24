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
import { DepartmentService } from './department/department.service';
import { UserService } from './user/user.service';
import { TaskService } from './task/task.service';
import { ReportModule } from './report/report.module';
import { SonetgroupService } from './sonetgroup/sonetgroup.service';
import { AppCron } from './app.cron';
import { WorkLogModule } from './work-log/work-log.module';

@Module({
  imports: [
    UserModule,
    ScheduleModule.forRoot(),
    WorkgroupModule,
    SharedModule,
    SonetgroupModule,
    TaskModule,
    DepartmentModule,
    ReportModule,
    WorkLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DepartmentService,
    UserService,
    TaskService,
    SonetgroupService,
    AppCron,
  ],
})
export class AppModule {}
