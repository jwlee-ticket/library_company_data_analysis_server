import { Injectable, Logger } from '@nestjs/common';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LiveModel } from 'src/live/entities/live.entity';
import { read } from 'fs';
import { Repository } from 'typeorm';
import * as moment from 'moment'; // 날짜를 처리하기 위해 moment.js 사용
import { DailyTargetModel } from './entities/daily-target.entity';


@Injectable()
export class TargetService {
  private readonly logger = new Logger(TargetService.name);

  constructor(
    @InjectRepository(LiveModel)
    private readonly liveRepository: Repository<LiveModel>,
    @InjectRepository(DailyTargetModel)
    private dailyTargetRepository: Repository<DailyTargetModel>,
  ) {

  }

  async makeDummy() {
    try {
      // 모든 LiveModel을 가져옵니다.


      const lives = await this.liveRepository.find();

      await this.dailyTargetRepository.delete({});

      for (const live of lives) {

        // showStartDate와 showEndDate를 사용하여 날짜 범위를 설정합니다.
        const startDate = moment(live.showStartDate);
        const endDate = moment(live.showEndDate).add(1, 'day');

        // startDate부터 endDate까지 모든 날짜를 반복합니다.
        for (let date = startDate; date.isBefore(endDate, 'day'); date.add(1, 'day')) {
          // DailyTargetModel에 더미 데이터를 삽입합니다.
          const dailyTarget = this.dailyTargetRepository.create({
            live: live, // 해당 LiveModel을 연결
            date: date.toDate(), // 현재 날짜
            target: live.id * 1000000, // target은 5,000,000
          });

          await this.dailyTargetRepository.save(dailyTarget);
        }
      }

      console.log('더미 데이터 삽입 완료!');

      return {
        code: 200,
        message: '더미 데이터 삽입 완료!',
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async createTarget(liveId: string, saleStartDate: Date, saleEndDate: Date) {
    try {
      const live = await this.liveRepository.findOne({ where: { liveId }, relations: ['dailyTarget'] });

      // saleStartDate와 saleEndDate를 moment로 변환하여 날짜 범위를 설정
      const startDate = moment(saleStartDate);
      const endDate = moment(saleEndDate).add(1, 'day'); // endDate에 하루를 더해 범위 포함

      // dailyTarget 데이터가 이미 존재하는 경우
      if (live.dailyTarget && live.dailyTarget.length > 0) {

        // 기존 데이터 중 startDate와 endDate에 속하지 않는 날짜는 삭제
        const targetDates = live.dailyTarget.map(target => moment(target.date).format('YYYY-MM-DD'));

        for (const target of live.dailyTarget) {
          const targetDate = moment(target.date);
          const deleteEndDate = moment(saleEndDate);
          if (targetDate.isBefore(startDate, 'day') || targetDate.isAfter(deleteEndDate, 'day')) {
            // startDate, endDate 범위 외의 날짜는 삭제
            await this.dailyTargetRepository.remove(target);
          }
        }

        // startDate부터 endDate까지 반복하여 데이터가 없으면 새로 추가
        for (let date = startDate; date.isBefore(endDate, 'day'); date.add(1, 'day')) {
          const dateString = date.format('YYYY-MM-DD');
          if (!targetDates.includes(dateString)) {
            // 존재하지 않으면 DailyTargetModel에 더미 데이터를 삽입

            const targetDate = new Date(date.toDate().setHours(0, 0, 0, 0));

            const dailyTarget = this.dailyTargetRepository.create({
              live: live, // 해당 LiveModel을 연결
              date: targetDate, // 현재 날짜
              target: 0,
            });
            await this.dailyTargetRepository.save(dailyTarget);
          }
        }

      } else {
        // dailyTarget이 비어있는 경우, startDate부터 endDate까지 모든 날짜를 반복하여 데이터 삽입
        for (let date = startDate; date.isBefore(endDate, 'day'); date.add(1, 'day')) {

          const targetDate = new Date(date.toDate().setHours(0, 0, 0, 0));
          const dailyTarget = this.dailyTargetRepository.create({
            live: live, // 해당 LiveModel을 연결
            date: targetDate, // 현재 날짜
            target: 0,
          });
          await this.dailyTargetRepository.save(dailyTarget);
        }
      }

    } catch (error) {
      this.logger.error(error);
    }
  }

  async changeTarget(updateTargetDto: UpdateTargetDto) {
    try {
      this.logger.debug('changeTarget', updateTargetDto);

      const { liveId, targets } = updateTargetDto;

      for (const target of targets) {

        const id = Number(target.id);

        const dailyTarget = await this.dailyTargetRepository.findOne({
          where: {
            id
          }
        });

        if (dailyTarget) {
          dailyTarget.target = target.target;
          await this.dailyTargetRepository.save(dailyTarget);
        }
      }

      return {
        code: 200,
        message: '타겟 데이터가 성공적으로 저장되었습니다.',
      }
    } catch (error) {
      this.logger.error(error);
    }
  }
}
