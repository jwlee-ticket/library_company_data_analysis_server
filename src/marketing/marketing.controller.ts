import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { CreateMarketingDto } from './dto/create-marketing.dto';
import { UpdateMarketingDto } from './dto/update-marketing.dto';

@Controller('marketing')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) { }

  @Post('set-calendar')
  async setCalendar(@Body() data: { liveId: string, startDate: string, endDate: string }) {
    const { liveId, startDate, endDate } = data;
    return this.marketingService.setMarketingCalendar(
      liveId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Post('set-marketing-data')
  async setMarketingData(@Body() data: { marketingData: UpdateMarketingDto[] }) {
    const { marketingData } = data;
    return this.marketingService.setMarketingData(marketingData);
  }
}
