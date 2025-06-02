import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyEtcModel } from './entities/montly-etc.entity';
import { UpdateMonthlyEtcDataDto } from './dto/update-monthly-etc-data.dto';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(MonthlyEtcModel)
    private readonly monthlyEtcRepository: Repository<MonthlyEtcModel>,
  ) { }


  async getMonthlyData(year: number) {
    try {
      const monthlyData = await this.monthlyEtcRepository.find({
        where: {
          year: year,
        },
        order: {
          month: 'ASC',
        },
      });

      if (!monthlyData || monthlyData.length === 0) {
        for (let i = 1; i <= 12; i++) {
          const newMonthlyData = this.monthlyEtcRepository.create({
            year: year,
            month: i,
          });
          await this.monthlyEtcRepository.save(newMonthlyData);
        }
      } else if (monthlyData.length < 12) {
        for (let i = 1; i <= 12; i++) {
          const monthExists = monthlyData.some((data) => data.month === i);
          if (!monthExists) {
            const newMonthlyData = this.monthlyEtcRepository.create({
              year: year,
              month: i,
            });
            await this.monthlyEtcRepository.save(newMonthlyData);
          }
        }
      } else {
        return {
          code: 200,
          data: monthlyData,
        }
      }

      const newMonthlyData = await this.monthlyEtcRepository.find({
        where: {
          year: year,
        },
        order: {
          month: 'ASC',
        },
      });

      return {
        code: 200,
        data: newMonthlyData,
      }

    } catch (error) {
      this.logger.error('Error fetching monthly data', error);
    }
  }

  async updateMonthlyData(monthlyData: UpdateMonthlyEtcDataDto[]) {
    try {

      for (const data of monthlyData) {
        const existingData = await this.monthlyEtcRepository.findOne({
          where: {
            id: data.id,
          },
        });

        if (existingData) {
          existingData.etc = data.etc;
          await this.monthlyEtcRepository.save(existingData);
        } else {
          const newMonthlyData = this.monthlyEtcRepository.create(data);
          await this.monthlyEtcRepository.save(newMonthlyData);
        }
      }

      return {
        code: 200,
        message: 'Monthly data updated successfully',
      };

    } catch (error) {
      this.logger.error('Error updating monthly data', error);
      throw new Error('Failed to update monthly data');
    }
  }

}


