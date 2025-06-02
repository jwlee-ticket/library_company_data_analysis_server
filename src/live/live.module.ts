import { Module } from '@nestjs/common';
import { LiveService } from './live.service';
import { LiveController } from './live.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveModel } from './entities/live.entity';
import { UserModel } from 'src/users/entities/user.entity';
import { TargetModule } from 'src/target/target.module';
import { CalendarModel } from 'src/calendar/entities/calendar.entity';
import { DailyTargetModel } from 'src/target/entities/daily-target.entity';
import { WeeklyMarketingCalendarModel } from 'src/marketing/entities/weekly-marketing-calendar.entity';
import { MarketingModule } from 'src/marketing/marketing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LiveModel,
      UserModel,
      WeeklyMarketingCalendarModel,
      DailyTargetModel,
    ]),
    TargetModule,
    MarketingModule,
  ],
  controllers: [LiveController],
  providers: [LiveService],
})
export class LiveModule { }
