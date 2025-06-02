import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklyMarketingCalendarModel } from './entities/weekly-marketing-calendar.entity';
import { LiveModel } from 'src/live/entities/live.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LiveModel,
      WeeklyMarketingCalendarModel,
    ],
    ),
  ],
  controllers: [MarketingController],
  providers: [MarketingService],
  exports: [MarketingService],
})
export class MarketingModule { }
