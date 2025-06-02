import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);

  constructor(private readonly reportService: ReportService,) { }

  @Get('get-daily-report')
  async sendDailyReport() {
    return this.reportService.playDailyReport();
  }

  @Get('get-weekly-report')
  async sendWeeklySalesReportByLive() {
    return this.reportService.playWeeklySalesReportByLive();
  }

  @Get('get-est-profit-report')
  async sendWeeklyEstProfitReport() {
    return this.reportService.playWeeklyEstProfitReport();
  }

  @Get('get-avg-share-report')
  async sendWeeklyPaidshareReport() {
    return this.reportService.playWeeklyPaidshareReport();
  }

  @Get('get-concert-total-sales-report')
  async sendConcertTotalSalesReport() {
    return this.reportService.concertTotalSalesReport();
  }
}
