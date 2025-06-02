import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WeeklyMarketingCalendarModel } from './entities/weekly-marketing-calendar.entity';
import { Repository } from 'typeorm';
import { LiveModel } from 'src/live/entities/live.entity';
import { UpdateMarketingDto } from './dto/update-marketing.dto';

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  constructor(
    @InjectRepository(WeeklyMarketingCalendarModel)
    private readonly marketingCalendarRepository: Repository<WeeklyMarketingCalendarModel>,
    @InjectRepository(LiveModel)
    private readonly liveRepository: Repository<LiveModel>,
  ) { }


  async setMarketingCalendar(
    liveId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<WeeklyMarketingCalendarModel[]> {

    try {

      // 1. Check if data exists for this liveId
      const existingCalendars = await this.marketingCalendarRepository.find({
        relations: ['live'],
        where: {
          live: { liveId },
        },
        order: {
          weekNumber: 'ASC',
        },
      });

      // 2. Get the live entity (will be needed for creating new entries)
      const live = await this.liveRepository.findOne({
        where: { liveId },
      });

      if (!live) {
        throw new Error(`Live event with ID ${liveId} not found`);
      }

      // 3. Generate the weekly calendar based on the date range
      const weeklyCalendars = this.generateWeeklyCalendar(startDate, endDate);

      // If no existing data, simply create new entries
      if (existingCalendars.length === 0) {
        const newCalendars = weeklyCalendars.map((week) => {
          const calendar = new WeeklyMarketingCalendarModel();
          calendar.live = live;
          calendar.weekNumber = week.weekNumber;
          calendar.weekStartDate = week.weekStartDate;
          calendar.weekEndDate = week.weekEndDate;
          return calendar;
        });

        return this.marketingCalendarRepository.save(newCalendars);
      }

      // 6. Update existing entries and create new ones if needed
      const updatedCalendars: WeeklyMarketingCalendarModel[] = [];
      const toDelete: number[] = [];

      // First, identify items to delete (those outside the new date range)
      for (const existing of existingCalendars) {
        const weekInNewRange = weeklyCalendars.find(
          (week) => week.weekNumber === existing.weekNumber,
        );

        if (!weekInNewRange) {
          // 7. If a week is no longer included in the date range, mark for deletion
          toDelete.push(existing.id);
        }
      }

      // Process each week in the new calendar
      for (const week of weeklyCalendars) {
        const existingWeek = existingCalendars.find(
          (cal) => cal.weekNumber === week.weekNumber,
        );

        if (existingWeek) {
          // Update dates for existing week
          existingWeek.weekStartDate = week.weekStartDate;
          existingWeek.weekEndDate = week.weekEndDate;
          updatedCalendars.push(existingWeek);
        } else {
          // Create new week entry
          const newCalendar = new WeeklyMarketingCalendarModel();
          newCalendar.live = live;
          newCalendar.weekNumber = week.weekNumber;
          newCalendar.weekStartDate = week.weekStartDate;
          newCalendar.weekEndDate = week.weekEndDate;
          updatedCalendars.push(newCalendar);
        }
      }

      // Delete entries that are no longer needed
      if (toDelete.length > 0) {
        await this.marketingCalendarRepository.delete(toDelete);
      }

      // Save all updates and new entries
      return this.marketingCalendarRepository.save(updatedCalendars);
    } catch (error) {
      this.logger.error(`Error in setMarketingCalendar: ${error.message}`, error.stack);

    }
  }


  private generateWeeklyCalendar(
    startDate: Date,
    endDate: Date,
  ): { weekNumber: number; weekStartDate: Date; weekEndDate: Date }[] {

    try {

      const result = [];
      // const start = new Date(startDate);
      // const end = new Date(endDate);

      const start = startDate;
      const end = endDate;

      // Adjust to find the first Monday (week start)
      // If startDate is not Monday, use startDate as first weekStartDate
      let currentDate = new Date(start);
      // let currentDate = start;

      // Find next Sunday
      let weekEndDate = new Date(currentDate);
      // let weekEndDate = currentDate;

      const daysUntilSunday = 7 - weekEndDate.getDay();
      // If today is Sunday (getDay() === 0), we need to set endDate to today
      if (daysUntilSunday === 7) {
        // Do nothing, weekEndDate is already Sunday
      } else {
        weekEndDate.setDate(weekEndDate.getDate() + daysUntilSunday);
      }

      // If weekEndDate exceeds the overall endDate, cap it
      if (weekEndDate > end) {
        weekEndDate = end;
      }

      let weekNumber = 1;

      // Create first week
      result.push({
        weekNumber,
        weekStartDate: new Date(currentDate),
        weekEndDate: new Date(weekEndDate),
      });

      // Process remaining weeks
      while (weekEndDate < end) {
        // Move to next Monday
        currentDate = new Date(weekEndDate);
        currentDate.setDate(currentDate.getDate() + 1);

        // Set next Sunday
        weekEndDate = new Date(currentDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);

        // If weekEndDate exceeds the overall endDate, cap it
        if (weekEndDate > end) {
          weekEndDate = new Date(end);
        }

        weekNumber++;

        result.push({
          weekNumber,
          weekStartDate: new Date(currentDate),
          weekEndDate: new Date(weekEndDate),
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`Error in generateWeeklyCalendar: ${error.message}`, error.stack);

    }
  }

  async setMarketingData(marketingData: UpdateMarketingDto[]) {
    try {
      this.logger.log(`Setting marketing data for ${marketingData.length} entries`);
      for (const data of marketingData) {
        const calendar = await this.marketingCalendarRepository.findOne({
          where: {
            id: data.id,
          },
        });

        if (calendar) {
          calendar.salesMarketing = data.salesMarketing;
          calendar.promotion = data.promotion;
          calendar.etc = data.etc;

          await this.marketingCalendarRepository.save(calendar);
        } else {
          this.logger.warn(`No calendar found for week number ${data.id} `);
        }
      }

    } catch (error) {
      this.logger.error(`Error in setMarketingData: ${error.message}`, error.stack);
    }
  }

}
