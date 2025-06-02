import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import puppeteer from 'puppeteer';
import { LiveModel } from './entities/live.entity';
import { ArrayContains, DataSource, In, Repository } from 'typeorm';
import { UserModel } from 'src/users/entities/user.entity';
import { CreateLiveDto } from './dto/create-live.dto';
import { UpdateLiveDto } from './dto/update-live.dto';
import { TargetService } from 'src/target/target.service';
import { startOfWeek, format } from 'date-fns';
import { MarketingService } from 'src/marketing/marketing.service';
import { WeeklyMarketingCalendarModel } from 'src/marketing/entities/weekly-marketing-calendar.entity';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class LiveService {
  private readonly logger = new Logger(LiveService.name);
  private readonly mode: string;
  private readonly isKst: boolean;

  constructor(
    @InjectRepository(LiveModel)
    private readonly liveRepository: Repository<LiveModel>,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(WeeklyMarketingCalendarModel)
    private readonly marketingCalendarRepository: Repository<WeeklyMarketingCalendarModel>,
    private readonly targetService: TargetService,
    private readonly dataSource: DataSource,
    private readonly marketingService: MarketingService,
    private readonly configService: ConfigService,
  ) {
    this.mode = this.configService.get<string>('MODE') || 'DEV';
    this.isKst = this.mode === 'DEV' ? false : true;
  }

  async saveLive(createLiveDto: CreateLiveDto) {
    try {
      const { liveId, category, showStartDate, showEndDate, manager } = createLiveDto;

      const liveName = createLiveDto.liveName.trim();

      const existingLive = await this.liveRepository.findOne({
        where: [
          { liveId },
          { liveName }
        ]
      });

      if (existingLive) {
        this.logger.debug('이미 저장된 데이터입니다.');
        return {
          status: false,
          message: '이미 저장된 데이터입니다.'
        };
      }


      const live = await this.liveRepository.findOne({ where: { liveId } });

      if (live) {
        this.logger.debug('이미 저장된 데이터입니다.');
        return {
          status: false,
          message: '이미 저장된 데이터입니다.'
        };
      }

      let newLive;


      if (category === '콘서트') {
        // const rowShowStartDate = new Date(showStartDate);
        // const concertDateTimeKst = this.isKst ? new Date(rowShowStartDate.getTime() + (9 * 60 * 60 * 1000)) : showStartDate;

        newLive = this.liveRepository.create({
          liveId,
          liveName,
          category,
          showStartDate,
          showEndDate,
          concertDateTime: showStartDate,
        });
      } else {
        newLive = this.liveRepository.create({
          liveId,
          liveName,
          category,
          showStartDate,
          showEndDate,
        });
      }

      this.logger.debug('createLiveDto:', JSON.stringify(createLiveDto));
      this.logger.debug('newLive:', JSON.stringify(newLive));

      await this.liveRepository.save(newLive);

      if (manager) {
        const user = await this.userRepository.findOne({ where: { id: Number(manager) } });
        if (!user) {
          this.logger.debug('해당 사용자가 존재하지 않습니다.');
        } else {
          if (user.liveNameList) {
            user.liveNameList.push(liveName);
          } else {
            user.liveNameList = [liveName
            ];
          }
          user.isLiveManager = true;
          await this.userRepository.save(user);
        }
      }


      return {
        status: 200,
        message: '데이터 저장 완료'
      };

    } catch (error) {
      this.logger.error('Error in saveLive:', error);
      return {
        status: 500,
        message: 'Internal server error'
      };
    }
  }

  async getLiveData(userId: number) {
    try {

      this.logger.debug('userId:', userId);
      const userInfo = await this.userRepository.findOne({ where: { id: userId } });
      let liveNameList = [];
      let liveInfoList = [];
      let finishedLiveData = [];


      if (!userInfo || !userInfo.liveNameList) {
        return {
          status: 404,
          liveList: liveInfoList,
          finishedLiveLive: finishedLiveData,
        };
      }

      if (userInfo.liveNameList.includes('전체')) {
        const liveInfo = await this.liveRepository.find();
        liveNameList = liveInfo.map(live => live.liveName);
      } else {
        liveNameList = userInfo.liveNameList;
      }

      for (const liveName of liveNameList) {

        // 먼저 live 정보를 찾습니다.
        const live = await this.liveRepository.findOne({ where: { liveName } });

        if (!live) {
          this.logger.debug('해당 공연 정보가 없습니다:', liveName);
          continue;
        }

        // '전체'가 포함된 사용자와 특정 공연을 관리하는 사용자들을 구분해서 찾기
        const userInfos = await this.userRepository
          .createQueryBuilder('user')
          .where(':liveName = ANY(CAST(user.liveNameList AS text[]))', { liveName })
          // .orWhere('user.liveNameList @> ARRAY[\'전체\']::text[]')
          .getMany();

        // userInfos 배열에서 각 유저의 이름만 추출합니다.
        const userNames = userInfos.map(user => user.name);

        if (live.isLive) {
          liveInfoList.push({
            live,
            userNames
          });
        } else {
          finishedLiveData.push({
            live,
            userNames
          });
        }
      }

      // live 정보와 userNames를 함께 반환합니다.
      return {
        status: 200,
        liveInfoList: liveInfoList,
        finishedLiveLive: finishedLiveData,
      };
    } catch (error) {
      this.logger.error('Error in getLiveData:', error);
      return {
        status: 500,
        message: 'Internal server error'
      };
    }
  }

  async getUserList() {
    try {
      const userList = await this.userRepository.find({ select: ['id', 'name'] });
      return {
        status: 200,
        userList
      };
    } catch (error) {
      this.logger.error('Error in getUserList:', error);
      return {
        status: 500,
        message: 'Internal server error'
      };
    }
  }

  async getLiveDetailData(liveId: string) {
    try {
      const live = await this.liveRepository.findOne({ where: { liveId }, relations: ['dailyTarget'] });
      let totalTarget = 0;

      if (!live) {
        return {
          status: 404,
          message: '해당 공연 정보가 없습니다.'
        };
      }

      // 주차별 데이터를 저장할 변수 (targets 필드 추가)
      const weeklyTargets: {
        week: number,
        dateLength: number,
        targets: { date: Date, target: number, id: number }[]
      }[] = [];

      if (live.dailyTarget && live.dailyTarget.length > 0) {
        // 날짜별로 정렬
        const sortedTargets = [...live.dailyTarget].sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        // 첫 번째 날짜로 시작 월요일을 계산
        const firstDate = new Date(sortedTargets[0].date);
        const firstMonday = startOfWeek(firstDate, { weekStartsOn: 1 }); // 월요일 기준으로 첫 주 시작

        // 각 타겟 데이터를 주차별로 분류
        sortedTargets.forEach(target => {
          const targetDate = new Date(target.date);
          const kstTargetDate = new Date(targetDate.getTime() + 9 * 60 * 60 * 1000); // KST로 변환

          // 해당 날짜가 속한 주의 월요일 찾기 (월요일 기준으로 시작)
          const weekStart = startOfWeek(kstTargetDate, { weekStartsOn: 1 }); // 월요일 기준으로 주 시작

          // 주차 계산 (첫 번째 월요일부터 현재 날짜의 월요일까지의 주 수)
          const weekNumber = Math.floor(
            (weekStart.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)
          ) + 1; // 1주차부터 시작

          // target 데이터 객체 생성
          const targetData = {
            date: kstTargetDate,
            target: target.target,
            id: target.id
          };

          // 해당 주차가 이미 있는지 확인
          const existingWeek = weeklyTargets.find(week => week.week === weekNumber);

          if (existingWeek) {
            // 이미 해당 주차가 있으면 날짜와 타겟 데이터 추가

            existingWeek.targets.push(targetData);
            existingWeek.dateLength = existingWeek.targets.length;
          } else {
            // 새로운 주차 추가
            weeklyTargets.push({
              week: weekNumber,

              targets: [targetData],
              dateLength: 1
            });
          }
        });

        // 각 주차 내에서 날짜 정렬
        weeklyTargets.forEach(weekly => {
          weekly.targets.sort((a, b) => a.date.getTime() - b.date.getTime());
        });

        // 주차 오름차순 정렬
        weeklyTargets.sort((a, b) => a.week - b.week);
        totalTarget = sortedTargets.reduce((acc, target) => acc + target.target, 0);
      }

      // dailyTarget 제외하고 반환
      const { dailyTarget, ...liveWithoutDailyTarget } = live;

      // 마케팅 데이터
      const marketingData = await this.marketingCalendarRepository.find({
        where: { live: { liveId } },
        order: { weekNumber: 'ASC' },
        select: {
          id: true,
          weekNumber: true,
          salesMarketing: true,
          promotion: true,
          weekStartDate: true,
          weekEndDate: true,
          etc: true,
        }
      });

      this.logger.debug('weeklyTargets:', JSON.stringify(weeklyTargets));

      return {
        status: 200,
        live: liveWithoutDailyTarget,
        totalTarget,
        weeklyTargets,
        marketingData,
      };
    } catch (error) {
      this.logger.error('Error in getLiveDetailData:', error);
      return {
        status: 500,
        message: 'Internal server error'
      };
    }
  }


  async changeLiveDetailData(updateLiveDto: UpdateLiveDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.debug('updateLiveDto:', JSON.stringify(updateLiveDto));
      const {
        perLiveId,
        liveId,
        liveName,
        category,
        isLive,
        location,
        showStartDate,
        showEndDate,
        saleStartDate,
        saleEndDate,
        runningTime,
        targetShare,
        bep,
        previewEndingDate,
        showTotalSeatNumber,
        concertDateTime,
        concertSeatNumberR,
        concertSeatNumberS,
        concertSeatNumberA,
        concertSeatNumberB,
        concertSeatNumberVip, } = updateLiveDto;

      const live = await queryRunner.manager.findOne(LiveModel, { where: { liveId: liveId } });

      if (!live) {
        await queryRunner.rollbackTransaction();
        return {
          status: 404,
          message: '해당 공연 정보가 없습니다.'
        };
      }


      if (live.liveName !== liveName) {
        const userInfo = await queryRunner.manager.find(UserModel, {
          where: { liveNameList: ArrayContains([live.liveName]) }
        });
        for (const user of userInfo) {
          const liveNameList = user.liveNameList.filter(name => name !== live.liveName);
          liveNameList.push(liveName);
          user.liveNameList = liveNameList;
          await queryRunner.manager.save(user);
        }
      }

      const rowPreviewEndingDate = new Date(previewEndingDate);
      const kstPreviewEndingDate = this.isKst ? new Date(rowPreviewEndingDate.getTime() + (9 * 60 * 60 * 1000)) : rowPreviewEndingDate;


      const rowSaleStartDate = new Date(saleStartDate);
      const kstSaleStartDate = this.isKst ? new Date(rowSaleStartDate.getTime() + (9 * 60 * 60 * 1000)) : rowSaleStartDate;


      const rowSaleEndDate = new Date(saleEndDate);
      const kstSaleEndDate = this.isKst ? new Date(rowSaleEndDate.getTime() + (9 * 60 * 60 * 1000)) : rowSaleEndDate;

      const rowShowStartDate = new Date(showStartDate);
      const kstShowStartDate = this.isKst ? new Date(rowShowStartDate.getTime() + (9 * 60 * 60 * 1000)) : rowShowStartDate;

      const rowShowEndDate = new Date(showEndDate);
      const kstShowEndDate = this.isKst ? new Date(rowShowEndDate.getTime() + (9 * 60 * 60 * 1000)) : rowShowEndDate;

      if (saleStartDate && saleEndDate) {
        if (live.saleStartDate !== kstSaleStartDate || live.saleEndDate !== kstSaleEndDate) {
          await this.targetService.createTarget(liveId, kstSaleStartDate, kstSaleEndDate);
        }
      }


      live.liveName = liveName;
      live.category = category;
      live.isLive = isLive;
      live.location = location;
      live.showStartDate = concertDateTime ? concertDateTime : kstShowStartDate;
      live.showEndDate = concertDateTime ? concertDateTime : kstShowEndDate;
      live.saleStartDate = saleStartDate ? kstSaleStartDate : null;
      live.saleEndDate = saleEndDate ? kstSaleEndDate : null;
      live.runningTime = runningTime;
      live.targetShare = targetShare;
      live.bep = bep;
      live.previewEndingDate = previewEndingDate ? kstPreviewEndingDate : null;
      live.showTotalSeatNumber = showTotalSeatNumber;
      live.concertDateTime = concertDateTime ? concertDateTime : null;
      live.concertSeatNumberR = concertSeatNumberR;
      live.concertSeatNumberS = concertSeatNumberS;
      live.concertSeatNumberA = concertSeatNumberA;
      live.concertSeatNumberB = concertSeatNumberB;
      live.concertSeatNumberVip = concertSeatNumberVip;

      await queryRunner.manager.save(live);



      if (live.saleStartDate !== null && live.saleEndDate !== null) {
        this.logger.debug('마케팅 일정 저장');
        this.logger.debug(`liveId: ${liveId}, saleStartDate: ${live.saleStartDate}, saleEndDate: ${live.saleEndDate}`);
        await this.marketingService.setMarketingCalendar(liveId, live.saleStartDate, live.saleEndDate);
      }

      await queryRunner.commitTransaction();

      return {
        status: 200,
        liveId: liveId,
        message: '공연 정보가 성공적으로 저장되었습니다.'
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error in changeLiveDetailData:', error);
      return {
        status: 500,
        message: 'Internal server error'
      };
    } finally {
      await queryRunner.release();
    }
  }

  async deleteLive(liveId: string) {
    try {
      const live = await this.liveRepository.findOne({ where: { liveId } });

      if (!live) {
        return {
          status: 404,
          message: '해당 공연 정보가 없습니다.'
        };
      }

      await this.liveRepository.delete(live.id);

      return {
        status: 200,
        message: '공연 정보가 삭제되었습니다.'
      };
    } catch (error) {
      this.logger.error('Error in deleteLive:', error);
      return {
        status: 500,
        message: 'Internal server error'
      };
    }
  }

}
