import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ReportService } from 'src/report/report.service';

@Injectable()
export class ReportJobService {
    private readonly logger = new Logger(ReportJobService.name);

    constructor(private readonly reportService: ReportService) { }

    // 매주 화요일 10시 (KST) = 화요일 01시 (UTC)
    @Cron('0 10 * * 2', {
        timeZone: 'Asia/Seoul'
    })
    async executeWeeklyReports() {
        try {
            this.logger.log('Starting weekly reports...');

            await Promise.all([
                this.reportService.playWeeklySalesReportByLive(),
                this.reportService.playWeeklyEstProfitReport(),
                this.reportService.playWeeklyPaidshareReport(),
            ]);

            this.logger.log('Weekly reports completed successfully');
        } catch (error) {
            this.logger.error('Error in weekly reports:', error);
        }
    }

    // 매일 14시 (KST) = 매일 05시 (UTC)
    @Cron('0 14 * * *', {
        timeZone: 'Asia/Seoul'
    })
    async executeDailyReports() {
        try {
            this.logger.log('Starting daily reports...');

            await Promise.all([
                this.reportService.playDailyReport(),
                this.reportService.concertTotalSalesReport(),
            ]);

            this.logger.log('Daily reports completed successfully');
        } catch (error) {
            this.logger.error('Error in daily reports:', error);
        }
    }
}