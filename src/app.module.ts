import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadModule } from './upload/upload.module';
import { PlayModule } from './play/play.module';
import { FileUploadModel } from './upload/entities/file-upload.entity';
import { PlayShowSaleModel } from './play/entities/play-show-sale.entity';
import { PlayTicketSaleModel } from './play/entities/play-ticket-sale.entity';
import { LiveModule } from './live/live.module';
import { LiveModel } from './live/entities/live.entity';
import { UsersModule } from './users/users.module';
import { CalendarModule } from './calendar/calendar.module';
import { UserModel } from './users/entities/user.entity';
import { CalendarModel } from './calendar/entities/calendar.entity';
import { TargetModule } from './target/target.module';
import { DailyTargetModel } from './target/entities/daily-target.entity';
import { MarketingModule } from './marketing/marketing.module';
import { WeeklyMarketingCalendarModel } from './marketing/entities/weekly-marketing-calendar.entity';
import { MonthlyEtcModel } from './calendar/entities/montly-etc.entity';
import { SlackModule } from './slack/slack.module';
import { ReportModule } from './report/report.module';
import { ViewLlmPlayDaily } from './report/entities/view-llm-play-daily.entity';
import { ViewLlmPlayWeeklyA } from './report/entities/view-llm-play-weekly-a.entity';
import { ViewLlmPlayWeeklyB } from './report/entities/view-llm-play-weekly-b.entity';
import { ViewLlmPlayWeeklyC } from './report/entities/view-llm-play-weekly-c.entity';
import { ViewLlmPlayWeeklyD } from './report/entities/view-llm-play-weekly-d.entity';
import { ViewLlmPlayEstProfit } from './report/entities/view_llm_play_est_profit.entity';
import { ViewLlmPlayWeeklyPaidshare } from './report/entities/view_llm_play_weekly_paidshare.entity';
import { ViewLlmPlayDailyA } from './report/entities/view_llm_play_daily_a.entity';
import { ViewLlmPlayDailyB } from './report/entities/view_llm_play_daily_b.entity';
import { ViewLlmPlayDailyC } from './report/entities/view_llm_play_daily_c.entity';
import { ConcertModule } from './concert/concert.module';
import { ConcertTicketSaleModel } from './concert/entities/concert-ticket-sale.entity';
import { ConcertSeatSaleModel } from './concert/entities/concert-seat-sale.entity';
import { ViewModule } from './view/view.module';
import { ViewConAllOverview } from './report/entities/view_con_all_overview.entity';
import { ViewConAllDaily } from './report/entities/view_con_all_daily.entity';
import { ViewConBep } from './report/entities/view_con_bep.entity';
import { ViewConTargetSales } from './report/entities/view_con_target_sales.entity';
import { ViewConWeeklyMarketingCalendar } from './report/entities/view_con_weekly_marketing_calendar.entity';
import { ViewConEstProfit } from './report/entities/view_con_est_profit.entity';
import { ViewConAllWeekly } from './report/entities/view_con_all_weekly.entity';
import { LocalScheduleModule } from './local-schedule/local-schedule.module';
import { SqlViewerModule } from './sql-viewer/sql-viewer.module';
import { AiChatModule } from './ai-chat/ai-chat.module';
// 새로 추가된 Play 관련 뷰 엔티티들
import { ViewPlayAllShowtime } from './report/entities/view-play-all-showtime.entity';
import { ViewPlayMonthlyAll } from './report/entities/view-play-monthly-all.entity';
import { ViewPlayMonthlyRespective } from './report/entities/view-play-monthly-respective.entity';
import { ViewPlayOverallRevenueAnalysis } from './report/entities/view-play-overall-revenue-analysis.entity';
import { ViewPlayRevenueByCast } from './report/entities/view-play-revenue-by-cast.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule,
        ScheduleModule.forRoot(),
      ],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: parseInt(configService.get('POSTGRES_PORT'), 10),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [
          PlayTicketSaleModel,
          PlayShowSaleModel,
          FileUploadModel,
          LiveModel,
          UserModel,
          DailyTargetModel,
          CalendarModel,
          WeeklyMarketingCalendarModel,
          MonthlyEtcModel,
          ConcertTicketSaleModel,
          ConcertSeatSaleModel,


          ViewLlmPlayDaily,
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
          ViewConAllWeekly,
          
          // 새로 추가된 Play 관련 뷰 엔티티들
          ViewPlayAllShowtime,
          ViewPlayMonthlyAll,
          ViewPlayMonthlyRespective,
          ViewPlayOverallRevenueAnalysis,
          ViewPlayRevenueByCast,
        ],
        synchronize: true,
        logging: true,
        timezone: 'Asia/Seoul',
      }),
      inject: [ConfigService],
    }),
    UploadModule,
    PlayModule,
    LiveModule,
    UsersModule,
    CalendarModule,
    TargetModule,
    MarketingModule,
    SlackModule,
    ReportModule,
    ConcertModule,
    ViewModule,
    LocalScheduleModule,
    SqlViewerModule,
    AiChatModule,
  ],
  controllers: [AppController],

  providers: [AppService],
})
export class AppModule { }
