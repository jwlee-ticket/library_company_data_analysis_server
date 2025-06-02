import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { UpdateMonthlyEtcDataDto } from './dto/update-monthly-etc-data.dto';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) { }

  @Get('get-monthly-etc-data')
  async getMonthlyEtcData(@Query('year') year: number) {
    return this.calendarService.getMonthlyData(year);
  }

  @Post('change-monthly-etc-data')
  async changeMonthlyEtcData(@Body() data: { monthlyEtcData: UpdateMonthlyEtcDataDto[] }) {
    return this.calendarService.updateMonthlyData(data.monthlyEtcData);
  }
}
