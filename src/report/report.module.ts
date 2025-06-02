import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { SlackModule } from '../slack/slack.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewLlmPlayDaily } from './entities/view-llm-play-daily.entity';
import { LiveModel } from 'src/live/entities/live.entity';
import { PlayTicketSaleModel } from 'src/play/entities/play-ticket-sale.entity';
import { ViewLlmPlayWeeklyA } from './entities/view-llm-play-weekly-a.entity';
import { ViewLlmPlayWeeklyB } from './entities/view-llm-play-weekly-b.entity';
import { ViewLlmPlayWeeklyC } from './entities/view-llm-play-weekly-c.entity';
import { ViewLlmPlayWeeklyD } from './entities/view-llm-play-weekly-d.entity';
import { ViewLlmPlayEstProfit } from './entities/view_llm_play_est_profit.entity';
import { ViewLlmPlayWeeklyPaidshare } from './entities/view_llm_play_weekly_paidshare.entity';
import { PlayShowSaleModel } from 'src/play/entities/play-show-sale.entity';
import { ViewLlmPlayDailyA } from './entities/view_llm_play_daily_a.entity';
import { ViewLlmPlayDailyB } from './entities/view_llm_play_daily_b.entity';
import { ViewLlmPlayDailyC } from './entities/view_llm_play_daily_c.entity';
import { ViewConAllOverview } from './entities/view_con_all_overview.entity';
import { ViewConAllDaily } from './entities/view_con_all_daily.entity';
import { ViewConBep } from './entities/view_con_bep.entity';
import { ViewConTargetSales } from './entities/view_con_target_sales.entity';
import { ViewConWeeklyMarketingCalendar } from './entities/view_con_weekly_marketing_calendar.entity';
import { ViewConEstProfit } from './entities/view_con_est_profit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ViewLlmPlayDaily,
      LiveModel,
      PlayTicketSaleModel,
      PlayShowSaleModel,
      ViewLlmPlayWeeklyA,
      ViewLlmPlayWeeklyB,
      ViewLlmPlayWeeklyC,
      ViewLlmPlayWeeklyD,
      ViewLlmPlayEstProfit,
      ViewLlmPlayWeeklyPaidshare,
      ViewLlmPlayDailyA,
      ViewLlmPlayDailyB,
      ViewLlmPlayDailyC,
      ViewConAllOverview,
      ViewConAllDaily,
      ViewConBep,
      ViewConTargetSales,
      ViewConWeeklyMarketingCalendar,
      ViewConEstProfit,
    ]),
    SlackModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule { }
