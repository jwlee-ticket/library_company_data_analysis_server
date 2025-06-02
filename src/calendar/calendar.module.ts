import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveModel } from 'src/live/entities/live.entity';
import { CalendarModel } from './entities/calendar.entity';
import { UserModel } from 'src/users/entities/user.entity';
import { MonthlyEtcModel } from './entities/montly-etc.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LiveModel,
      CalendarModel,
      UserModel,
      MonthlyEtcModel,
    ]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule { }
