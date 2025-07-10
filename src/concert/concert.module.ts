import { Module } from '@nestjs/common';
import { ConcertService } from './concert.service';
import { ConcertController } from './concert.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConcertTicketSaleModel } from './entities/concert-ticket-sale.entity';
import { ConcertSeatSaleModel } from './entities/concert-seat-sale.entity';
import { ViewConAllDaily } from '../report/entities/view_con_all_daily.entity';
import { ViewConAllOverview } from '../report/entities/view_con_all_overview.entity';
import { ViewConBep } from '../report/entities/view_con_bep.entity';
import { ViewConEstProfit } from '../report/entities/view_con_est_profit.entity';
import { ViewConTargetSales } from '../report/entities/view_con_target_sales.entity';
import { ViewConWeeklyMarketingCalendar } from '../report/entities/view_con_weekly_marketing_calendar.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConcertTicketSaleModel,
      ConcertSeatSaleModel,
      ViewConAllDaily,
      ViewConAllOverview,
      ViewConBep,
      ViewConEstProfit,
      ViewConTargetSales,
      ViewConWeeklyMarketingCalendar,
    ]),
  ],
  controllers: [ConcertController],
  providers: [ConcertService],
  exports: [ConcertService],
})
export class ConcertModule { }
