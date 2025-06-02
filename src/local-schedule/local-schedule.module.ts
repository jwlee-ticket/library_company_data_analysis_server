import { Module } from '@nestjs/common';
import { LocalScheduleService } from './local-schedule.service';
import { LocalScheduleController } from './local-schedule.controller';
import { ReportModule } from 'src/report/report.module';
import { ReportJobService } from './jobs/report-job.service';

@Module({
  imports: [
    ReportModule,
  ],
  controllers: [LocalScheduleController],
  providers: [LocalScheduleService, ReportJobService],
  exports: [LocalScheduleService]
})
export class LocalScheduleModule { }
