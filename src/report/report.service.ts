import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SlackService } from '../slack/slack.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Between } from 'typeorm';
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
import { OpenAI } from 'openai';
import { ViewConAllOverview } from './entities/view_con_all_overview.entity';
import { ViewConAllDaily } from './entities/view_con_all_daily.entity';
import { ViewConBep } from './entities/view_con_bep.entity';
import { ViewConTargetSales } from './entities/view_con_target_sales.entity';
import { ViewConWeeklyMarketingCalendar } from './entities/view_con_weekly_marketing_calendar.entity';
import { ViewConEstProfit } from './entities/view_con_est_profit.entity';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);
  private readonly openai: OpenAI;

  constructor(
    @InjectRepository(LiveModel)
    private liveRepository: Repository<LiveModel>,
    @InjectRepository(PlayTicketSaleModel)
    private playTicketRepository: Repository<PlayTicketSaleModel>,
    @InjectRepository(PlayShowSaleModel)
    private playShowSaleRepository: Repository<PlayShowSaleModel>,
    @InjectRepository(ViewLlmPlayWeeklyA)
    private viewLlmPlayWeeklyARepository: Repository<ViewLlmPlayWeeklyA>,
    @InjectRepository(ViewLlmPlayWeeklyB)
    private viewLlmPlayWeeklyBRepository: Repository<ViewLlmPlayWeeklyB>,
    @InjectRepository(ViewLlmPlayWeeklyC)
    private viewLlmPlayWeeklyCRepository: Repository<ViewLlmPlayWeeklyC>,
    @InjectRepository(ViewLlmPlayWeeklyD)
    private viewLlmPlayWeeklyDRepository: Repository<ViewLlmPlayWeeklyD>,
    @InjectRepository(ViewLlmPlayEstProfit)
    private viewLlmPlayEstProfitRepository: Repository<ViewLlmPlayEstProfit>,
    @InjectRepository(ViewLlmPlayWeeklyPaidshare)
    private viewLlmPlayWeeklyPaidshareRepository: Repository<ViewLlmPlayWeeklyPaidshare>,
    @InjectRepository(ViewLlmPlayDailyA)
    private viewLlmPlayDailyARepository: Repository<ViewLlmPlayDailyA>,
    @InjectRepository(ViewLlmPlayDailyB)
    private viewLlmPlayDailyBRepository: Repository<ViewLlmPlayDailyB>,
    @InjectRepository(ViewLlmPlayDailyC)
    private viewLlmPlayDailyCRepository: Repository<ViewLlmPlayDailyC>,
    @InjectRepository(ViewConAllOverview)
    private viewConAllOverviewRepository: Repository<ViewConAllOverview>,
    @InjectRepository(ViewConAllDaily)
    private viewConAllDailyRepository: Repository<ViewConAllDaily>,
    @InjectRepository(ViewConBep)
    private viewConBepRepository: Repository<ViewConBep>,
    @InjectRepository(ViewConTargetSales)
    private viewConTargetSalesRepository: Repository<ViewConTargetSales>,
    @InjectRepository(ViewConWeeklyMarketingCalendar)
    private viewConWeeklyMarketingCalendarRepository: Repository<ViewConWeeklyMarketingCalendar>,
    @InjectRepository(ViewConEstProfit)
    private viewConEstProfitRepository: Repository<ViewConEstProfit>,
    private readonly configService: ConfigService,
    private readonly slackService: SlackService
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  private readonly promptRules = `
  1. 응답은 매우 간결하게 50단어 이내로 작성해주세요.
  2. 응답은 반드시 완전한 문장으로 끝나야 합니다.
  3. 문장의 끝맺음은 "~필요함" "~해야함" "~필요가 있음" 등 음슴체로 끝나야 합니다.
  4. 문장이 중간에 잘리거나, 불완전한 상태로 끝나지 않아야 합니다.
  5. 예를들어, 3월 후반으로 갈수록 점유율 하락 추세 → 원인 분석 및 회차별 대응 필요함
  `;


  async playDailyReport() {
    try {

      const now = new Date();
      const dayOfWeek = now.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
      const dayOfWeekKorean = ['일', '월', '화', '수', '목', '금', '토'][dayOfWeek];

      let message = `\n*[${now.getMonth() + 1}/${now.getDate()}(${dayOfWeekKorean}) 일간 공연 현황]*\n\n`;
      const dailyA = await this.viewLlmPlayDailyARepository.find();
      const dailyB = await this.viewLlmPlayDailyBRepository.find();
      const dailyC = await this.viewLlmPlayDailyCRepository.find();

      const dailySalesAMessage = this.formatDailySalesA(dailyA);
      const dailySalesBMessage = this.formatDailySalesB(dailyB);
      const dailySalesCMessage = this.formatDailySalesC(dailyC);

      message += dailySalesAMessage;
      message += '\n\n\n';
      message += dailySalesBMessage;
      message += '\n\n\n';
      message += dailySalesCMessage;
      message += '* 점유율 = 유료 점유율 + 무료 점유율\n';
      message += '* 잔여석 = 판매가능 총 좌석 - (유료 판매 좌석 + 무료 좌석)\n';


      await this.slackService.sendMessage(message);

      return {
        code: 200,
        message: '일간 공연 현황 리포트 전송 완료',
        data: message,
      }

    } catch (error) {
      this.logger.error(`Error generating daily report: ${error.message}`);

      return {
        code: 500,
        message: error.message
      }
    }
  }

  formatDailySalesA(dailyA: ViewLlmPlayDailyA[]) {
    const presentSalesUpdateDate = [];

    presentSalesUpdateDate.push('*1. 판매현황 최신 업데이트일*');
    dailyA.forEach(live => {
      const recordDate = new Date(live.latestRecordDate);
      const month = recordDate.getMonth() + 1;
      const day = recordDate.getDate();
      presentSalesUpdateDate.push(`<${live.liveName}> : ${month}/${day}`);
    });

    presentSalesUpdateDate.push('\n');


    presentSalesUpdateDate.push('*2. 티켓 판매 매출*');
    dailyA.forEach(data => {
      const recordDate = new Date(data.latestTicketSalesDate);
      const month = recordDate.getMonth() + 1;
      const day = recordDate.getDate();
      presentSalesUpdateDate.push(`<${data.liveName}> : ${this.formatNumber(Number(data.latestTicketSales))} (${month}/${day})`);
    });

    return presentSalesUpdateDate.join('\n');
  }

  formatDailySalesB(dailyB: ViewLlmPlayDailyB[]) {
    const presentSalesUpdateDate = [];

    presentSalesUpdateDate.push('*3. 전일 공연 대비 점유율*');
    dailyB.forEach(data => {
      const latestDate = new Date(data.latestDate);
      const formatLatestDate = latestDate.getMonth() + 1 + '/' + latestDate.getDate();
      const previousDate = new Date(data.prevDate);
      const formatPreviousDate = previousDate.getMonth() + 1 + '/' + previousDate.getDate();
      const icon = 0 < data.changeShare ? '↑' : '⭣';
      presentSalesUpdateDate.push(`<${data.liveName}> : ${icon} ${Number(data.changeShare).toFixed(0)}% (${formatPreviousDate} → ${formatLatestDate})`);
    });

    return presentSalesUpdateDate.join('\n');
  }

  formatDailySalesC(dailyC: ViewLlmPlayDailyC[]) {
    const dailySalesCMap: Map<string, string[]> = new Map();
    const presentSalesUpdateDate = [];

    presentSalesUpdateDate.push('*4. 향후 7일 회차별 현황*');
    dailyC.forEach(data => {
      const key = data.liveName;
      if (!dailySalesCMap.has(key)) {
        dailySalesCMap.set(key, []);
        dailySalesCMap.get(key).push(`<${data.liveName}>`);
      }
      const showDateTime = new Date(data.showDate);
      const formatShowDate = showDateTime.getMonth() + 1 + '/' + showDateTime.getDate();
      const formatShowTime = showDateTime.getHours().toString().padStart(2, '0') + ':' + showDateTime.getMinutes().toString().padStart(2, '0');
      const dayOfWeekKorean = ['일', '월', '화', '수', '목', '금', '토'][showDateTime.getDay()];
      dailySalesCMap.get(key).push(`- ${formatShowDate}(${dayOfWeekKorean}) ${formatShowTime} → ${data.share}% (잔여: ${data.remainingSeats}석)`);
    });

    dailySalesCMap.forEach((value, key) => {
      presentSalesUpdateDate.push(value.join('\n'));
      presentSalesUpdateDate.push('\n');
    });

    return presentSalesUpdateDate.join('\n');
  }


  async playWeeklySalesReportByLive() {
    try {
      let message = `\n*[${this.weekNumber()} 주간 공연 현황]*\n\n`;
      const weeklyA = await this.viewLlmPlayWeeklyARepository.find();
      const weeklyB = await this.viewLlmPlayWeeklyBRepository.find();
      const weeklyC = await this.viewLlmPlayWeeklyCRepository.find({ select: { liveName: true, paidShare: true, freeShare: true, showDateTime: true } });
      const weeklyD = await this.viewLlmPlayWeeklyDRepository.find();

      const weeklySalesAMap = this.formatWeeklySalesA(weeklyA);
      const weeklySalesBMap = this.formatWeeklySalesB(weeklyB); // B 데이터 포맷
      const weeklySalesCMap = this.formatWeeklySalesC(weeklyC);
      const weeklySalesDMap = await this.formatWeeklySalesD(weeklyD, weeklyA);

      weeklySalesAMap.forEach((value, key) => {


        message += `\n*<${key}>*\n\n${value.join('\n')}`;

        // 같은 공연에 대한 B 데이터가 있으면 추가
        if (weeklySalesBMap.has(key)) {
          message += `\n\n\n${weeklySalesBMap.get(key).join('\n\n')}`;
        }


        if (weeklySalesCMap.has(key)) {
          message += `\n\n\n${weeklySalesCMap.get(key).join('\n\n')}`;
        }

        if (weeklySalesDMap.has(key)) {
          message += `\n\n\n${weeklySalesDMap.get(key).join('\n\n')}`;
        }


        message += `\n\n\n`;

      });

      await this.slackService.sendMessage(message);

      return {
        code: 200,
        message: '주간 공연 현황 리포트 전송 완료',
        data: message,
      }
    } catch (error) {
      this.logger.error(`Error generating weekly sales report: ${error.message}`);

      return {
        code: 500,
        message: error.message,
      }
    }
  }

  formatWeeklySalesA(weeklyA: ViewLlmPlayWeeklyA[]) {
    const weeklySalesAMap: Map<string, string[]> = new Map();

    weeklyA.forEach(item => {
      if (!weeklySalesAMap.has(item.liveName)) {
        weeklySalesAMap.set(item.liveName, []);
        weeklySalesAMap.get(item.liveName).push(`A *[전주]* 목표 *점유율* : ${item.targetShare}% / 실제 점유율: ${Number(item.avgPaidShare).toFixed(2)}% (${(Number(item.avgPaidShare) - item.targetShare).toFixed(2)}% ${Number(item.avgPaidShare) - item.targetShare > 0 ? '초과' : '미달'})`);
        weeklySalesAMap.get(item.liveName).push(`A *[전주]* 목표 *매출* : ${this.formatNumber(Number(item.totalTargetSales))}원 / 실제 : ${this.formatNumber(Number(item.totalActualSales))}원 (${this.formatNumber(item.totalActualSales - item.totalTargetSales)} ${item.totalActualSales - item.totalTargetSales > 0 ? '초과' : '미달'})`);
      }
    });

    return weeklySalesAMap;
  }

  formatWeeklySalesB(weeklyB: ViewLlmPlayWeeklyB[]) {
    const weeklySalesBMap: Map<string, string[]> = new Map();

    // 먼저 liveId/liveName 별로 데이터 그룹화
    const liveGroups = new Map<string, ViewLlmPlayWeeklyB[]>();

    weeklyB.forEach(item => {
      const key = item.liveId;
      if (!liveGroups.has(key)) {
        liveGroups.set(key, []);
      }
      liveGroups.get(key).push(item);
    });

    // 각 그룹 내에서 totalSales 기준으로 정렬
    liveGroups.forEach((items, liveId) => {
      // 매출 기준 내림차순 정렬 (문자열을 숫자로 변환하여 정렬)
      const sortedItems = items.sort((a, b) =>
        Number(b.totalSales) - Number(a.totalSales)
      );

      const liveName = sortedItems[0].liveName;

      weeklySalesBMap.set(liveName, []);
      weeklySalesBMap.get(liveName).push(`B [전주] *캐스트별 매출 순위* :`);

      // 상위 3개만 표시하거나 있는 만큼만 표시
      const limit = Math.min(sortedItems.length, 3);

      for (let i = 0; i < limit; i++) {
        const item = sortedItems[i];
        // 이모지 번호와 함께 캐스트 정보와 매출 표시
        const emoji = i === 0 ? '1️⃣' : i === 1 ? '2️⃣' : '3️⃣';
        weeklySalesBMap.get(liveName).push(
          `${emoji} ${item.cast} | ${this.formatNumber(Number(item.totalSales))}원 (${item.showCount}회)`
        );
      }
    });

    return weeklySalesBMap;
  }

  formatWeeklySalesC(weeklyC: ViewLlmPlayWeeklyC[]) {
    const weeklySalesCMap: Map<string, string[]> = new Map();
    const liveGroups = new Map<string, ViewLlmPlayWeeklyC[]>();

    // 현재 날짜 계산
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 이번 주의 시작과 끝 (월요일 기준)
    const currentWeekStart = new Date(today);
    const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 월요일이 주의 시작
    currentWeekStart.setDate(today.getDate() + diff);

    // 다음 주의 시작과 끝
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(currentWeekStart.getDate() + 7);

    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

    // 공연별로 데이터 그룹화
    weeklyC.forEach(item => {
      const key = item.liveName;
      if (!liveGroups.has(key)) {
        liveGroups.set(key, []);
      }
      liveGroups.get(key).push({
        ...item,
        // 문자열을 숫자로 변환
        paidShare: Number(item.paidShare),
        freeShare: Number(item.freeShare)
      });
    });

    liveGroups.forEach((items, liveName) => {
      weeklySalesCMap.set(liveName, []);

      // 날짜 기준으로 정렬
      const sortedItems = items.sort((a, b) =>
        new Date(a.showDateTime).getTime() - new Date(b.showDateTime).getTime()
      );

      // 저조 회차 찾기 (총 점유율 40% 미만)
      const lowPerformances = sortedItems.filter(item => {
        const totalShare = Number(item.paidShare) + Number(item.freeShare);
        return totalShare < 40;
      });

      // 저조 회차 메시지 작성
      weeklySalesCMap.get(liveName).push(`C [금주 / 차주] 예상 점유율 저조 회차 :`);

      if (lowPerformances.length > 0) {
        lowPerformances.forEach(item => {
          const showDateTime = new Date(item.showDateTime);
          const totalShare = Number(item.paidShare) + Number(item.freeShare);

          // 날짜 형식 변환 (예: 4/22(월) 19:30)
          const month = showDateTime.getMonth() + 1;
          const day = showDateTime.getDate();
          const weekDay = ['일', '월', '화', '수', '목', '금', '토'][showDateTime.getDay()];
          const hour = showDateTime.getHours().toString().padStart(2, '0');
          const minute = showDateTime.getMinutes().toString().padStart(2, '0');

          const formattedDate = `${month}/${day}(${weekDay}) ${hour}:${minute}`;

          weeklySalesCMap.get(liveName).push(`- ${formattedDate} (${totalShare}% 예상)`);
        });
      } else {
        weeklySalesCMap.get(liveName).push(`* 저조회차 없음`);
      }

      // 차주 데이터만 필터링
      const nextWeekItems = sortedItems.filter(item => {
        const itemDate = new Date(item.showDateTime);
        return itemDate >= nextWeekStart && itemDate <= nextWeekEnd;
      });

      // 차주 데이터가 있을 경우 평균 계산
      if (nextWeekItems.length > 0) {
        const nextWeekTotalShares = nextWeekItems.map(item =>
          Number(item.paidShare) + Number(item.freeShare)
        );
        const avgNextWeekShare = Math.round(
          nextWeekTotalShares.reduce((sum, share) => sum + share, 0) / nextWeekTotalShares.length
        );

        weeklySalesCMap.get(liveName).push(`C [차주] 점유율 (마지막 데이터 기준) 평균값 : *${avgNextWeekShare}%*`);
      } else {
        weeklySalesCMap.get(liveName).push(`C [차주] 점유율 데이터 없음`);
      }
    });

    return weeklySalesCMap;
  }

  async formatWeeklySalesD(weeklyD: ViewLlmPlayWeeklyD[], weeklyA: ViewLlmPlayWeeklyA[]) {
    const weeklySalesDMap: Map<string, string[]> = new Map();
    const liveGroups = new Map<string, ViewLlmPlayWeeklyD[]>();

    // 공연별로 데이터 그룹화
    weeklyD.forEach(item => {
      if (!item.weekType) return; // weekType이 null인 항목은 건너뜀

      const key = item.liveName;
      if (!liveGroups.has(key)) {
        liveGroups.set(key, []);
      }
      liveGroups.get(key).push(item);
    });

    // 매출 데이터 맵 생성
    const salesDataMap = new Map<string, {
      totalActualSales: number,
      weekBeforeLastTotalActualSales: number
    }>();

    weeklyA.forEach(item => {
      salesDataMap.set(item.liveName, {
        totalActualSales: Number(item.totalActualSales),
        weekBeforeLastTotalActualSales: Number(item.weekBeforeLastTotalActualSales)
      });
    });

    // 분석 요청을 Promise 배열에 저장
    const analysisPromises = [];

    liveGroups.forEach((items, liveName) => {
      weeklySalesDMap.set(liveName, []);

      // 주 타입별로 정리 (전주, 금주, 차주)
      const prevWeekData = items.find(item => item.weekType === '전주');
      const currentWeekData = items.find(item => item.weekType === '금주');
      const nextWeekData = items.find(item => item.weekType === '차주');

      // 금주/차주 마케팅 정보 출력
      weeklySalesDMap.get(liveName).push(`D [금주 / 차주] 진행 예정 세일즈 마케팅 및 프로모션:`);

      // 금주 정보
      if (currentWeekData && currentWeekData.weekStartDate && currentWeekData.weekEndDate) {
        const startDate = new Date(currentWeekData.weekStartDate);
        const endDate = new Date(currentWeekData.weekEndDate);

        const startMonth = startDate.getMonth() + 1;
        const startDay = startDate.getDate();
        const startDayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][startDate.getDay()];

        const endMonth = endDate.getMonth() + 1;
        const endDay = endDate.getDate();
        const endDayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][endDate.getDay()];

        weeklySalesDMap.get(liveName).push(`a 금주 [ ${startMonth}/${startDay}(${startDayOfWeek}) ~ ${endMonth}/${endDay}(${endDayOfWeek}) ] : ${currentWeekData.salesMarketing || '없음'} / ${currentWeekData.promotion || '없음'} / ${currentWeekData.etc || '없음'} `);
      } else {
        weeklySalesDMap.get(liveName).push(`a 금주 : 데이터 없음`);
      }

      // 차주 정보
      if (nextWeekData && nextWeekData.weekStartDate && nextWeekData.weekEndDate) {
        const startDate = new Date(nextWeekData.weekStartDate);
        const endDate = new Date(nextWeekData.weekEndDate);

        const startMonth = startDate.getMonth() + 1;
        const startDay = startDate.getDate();
        const startDayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][startDate.getDay()];

        const endMonth = endDate.getMonth() + 1;
        const endDay = endDate.getDate();
        const endDayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][endDate.getDay()];

        weeklySalesDMap.get(liveName).push(`b 차주 [ ${startMonth}/${startDay}(${startDayOfWeek}) ~ ${endMonth}/${endDay}(${endDayOfWeek}) ] : ${nextWeekData.salesMarketing || '없음'} / ${nextWeekData.promotion || '없음'} / ${nextWeekData.etc || '없음'} `);
      } else {
        weeklySalesDMap.get(liveName).push(`b 차주 : 데이터 없음`);
      }

      // 전주 마케팅 요약 출력
      if (prevWeekData) {
        const startDate = new Date(prevWeekData.weekStartDate);
        const endDate = new Date(prevWeekData.weekEndDate);

        const startMonth = startDate.getMonth() + 1;
        const startDay = startDate.getDate();
        const startDayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][startDate.getDay()];

        const endMonth = endDate.getMonth() + 1;
        const endDay = endDate.getDate();
        const endDayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][endDate.getDay()];

        weeklySalesDMap.get(liveName).push(`D [ 전주 ] 마케팅 요약 (매출과의 연관성 분석):`);
        weeklySalesDMap.get(liveName).push(`a 전주 [ ${startMonth}/${startDay}(${startDayOfWeek}) ~ ${endMonth}/${endDay}(${endDayOfWeek}) ] : ${prevWeekData.salesMarketing || '없음'} / ${prevWeekData.promotion || '없음'} / ${prevWeekData.etc || '없음'} `);

        // 매출 데이터가 있으면 LLM 분석 수행
        const salesData = salesDataMap.get(liveName);
        if (salesData && prevWeekData.salesMarketing) {

          // LLM 분석 Promise 생성
          const analysisPromise = this.playAnalyzeSalesMarketing(
            liveName,
            prevWeekData.salesMarketing || '',
            prevWeekData.promotion || '',
            prevWeekData.etc || '',
            salesData.totalActualSales,
            salesData.weekBeforeLastTotalActualSales
          ).then(analysis => {
            return { liveName, analysis };
          }).catch(error => {
            this.logger.error(`마케팅 분석 중 오류 발생 (${liveName}): ${error.message}`);
            return { liveName, analysis: '' };
          });

          analysisPromises.push(analysisPromise);
        }
      } else {
        weeklySalesDMap.get(liveName).push(`a 전주 데이터 없음`);
      }
    });

    // 모든 분석 결과가 완료될 때까지 기다림
    try {
      const analysisResults = await Promise.all(analysisPromises);

      // 분석 결과 추가
      analysisResults.forEach(result => {
        if (result.analysis && weeklySalesDMap.has(result.liveName)) {
          weeklySalesDMap.get(result.liveName).push(result.analysis);
        }
      });
    } catch (error) {
      this.logger.error(`마케팅 분석 결과 처리 중 오류 발생: ${error.message}`);
      // 오류가 발생해도 기본 데이터는 유지
    }

    return weeklySalesDMap;
  }

  // 마케팅 효과 분석 함수 추가
  async playAnalyzeSalesMarketing(
    liveName: string,
    marketing: string,
    promotion: string,
    etc: string,
    currentSales: number,
    previousSales: number
  ): Promise<string> {
    try {
      // 매출 변화율 계산
      let changeText = "변화 없음";
      let changeRate = 0;

      if (previousSales > 0) {
        changeRate = ((currentSales - previousSales) / previousSales) * 100;
        const roundedChangeRate = Math.round(changeRate);
        if (roundedChangeRate > 0) {
          changeText = `${roundedChangeRate}% 상승`;
        } else if (roundedChangeRate < 0) {
          changeText = `${Math.abs(roundedChangeRate)}% 하락`;
        }
      }

      const prompt = `
  다음은 공연 "${liveName}"의 마케팅 데이터입니다:
  - 마케팅: ${marketing}
  - 프로모션: ${promotion}
  - 기타: ${etc}
  - 전주 매출: ${currentSales.toLocaleString('ko-KR')}원
  - 전전주 매출: ${previousSales.toLocaleString('ko-KR')}원
  - 매출 변화: ${changeText}
  
  이 데이터를 바탕으로 마케팅과 매출의 연관성을 분석하고, 한 줄로 요약해주세요.
  
  다음 형식으로 작성해주세요: "*[매출 변화 요약] → [간결한 전략적 제안]*"
  문장의 맨앞, 맨뒤에는 * 를 붙여주세요.
  
  매출 변화 요약은 아래 예시 형식처럼 작성해주세요.
  - 전주 대비 매출 15~18% 상승
  - 전주 대비 매출 15~18% 하락
  - 전주 대비 매출 변화 없음

  위의 응답 형식을 유지하면서,
  [간결한 전략적 제안] 부분에는 아래 조건을 준수해주세요.
  ${this.promptRules}
  `;



      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "당신은 공연 마케팅 분석가입니다. 마케팅 데이터와 매출 변화를 분석하여 통찰력 있는 분석을 제공합니다." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      return response.choices[0].message.content.trim();

    } catch (error) {
      this.logger.error('마케팅 분석 중 오류 발생:', error);
      return ''; // 오류 발생 시 빈 문자열 반환
    }
  }


  async playWeeklyEstProfitReport() {
    try {
      const estProfit = await this.viewLlmPlayEstProfitRepository.find();

      // 기본 메시지 생성 (오류 발생 시 이것만 전송됨)
      const baseEstProfitMap = this.formatEstProfit(estProfit);

      try {
        // LLM 분석 추가
        const analysisResult = await this.playAnalyzeEstProfit(estProfit);

        // 분석 결과가 있으면 기본 메시지에 추가
        let finalMessage = baseEstProfitMap;
        if (analysisResult) {
          finalMessage += `\n${analysisResult}`;
        }

        await this.slackService.sendMessage(finalMessage);

        return {
          code: 200,
          message: '최종 손익 전망 리포트 전송 완료',
          data: finalMessage,
        };
      } catch (analysisError) {
        // 분석 중 오류 발생 시 기본 메시지만 전송
        this.logger.error('손익 분석 중 오류 발생:', analysisError);
        await this.slackService.sendMessage(baseEstProfitMap);

        return {
          code: 200,
          message: '최종 손익 전망 리포트 전송 완료 (분석 제외)',
          data: baseEstProfitMap,
        };
      }
    } catch (e) {
      this.logger.error(e);

      return {
        code: 500,
        message: e.message,
      };
    }
  }

  async playAnalyzeEstProfit(estProfit: ViewLlmPlayEstProfit[]): Promise<string> {
    try {
      // 분석 대상 데이터 준비
      const profitData = estProfit.map(item => {
        return {
          liveName: item.liveName,
          estTotalRevenue: Number(item.estTotalRevenue),
          bep: Number(item.bep),
          estTotalProfit: Number(item.estTotalProfit)
        };
      });

      // BEP 달성/미달 작품 분류
      const profitableWorks = profitData.filter(item => item.estTotalProfit >= 0);
      const unprofitableWorks = profitData.filter(item => item.estTotalProfit < 0);

      // 작품명 목록 생성
      const profitableNames = profitableWorks.map(item => item.liveName).join(', ');
      const unprofitableNames = unprofitableWorks.map(item => item.liveName).join(', ');

      const prompt = `
  다음은 공연 작품들의 예상 수익 데이터입니다:
  ${JSON.stringify(profitData, null, 2)}
  
  이 데이터를 바탕으로 간결한 수익성 분석과 전략적 제안을 한 줄로 요약해주세요.

  5. 다음 형식으로 작성해주세요:
  "*[간결한 분석 내용] → [간결한 전략적 제안]*"
  
  위의 형식을 유지하면서,
  [ 간결한 전략적 제안 ] 부분에는 아래 조건을 준수해주세요.
  ${this.promptRules}
  `;


      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "당신은 공연 재무 분석가입니다. 공연 예상 수익 데이터를 바탕으로 매우 간결하고 완결된 통찰을 제공합니다." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200 // 토큰 수 증가
      });

      // 응답 검증 및 처리
      let analysisResult = response.choices[0].message.content.trim();

      // 응답이 '*'로 시작하지 않으면 추가
      if (!analysisResult.startsWith('*')) {
        analysisResult = `*${analysisResult}`;
      }

      // 응답이 '*'로 끝나지 않으면 추가
      if (!analysisResult.endsWith('*')) {
        analysisResult = `${analysisResult}*`;
      }

      // 응답 길이 확인 및 로깅
      this.logger.debug(`분석 결과 (${analysisResult.length}자): ${analysisResult}`);

      return analysisResult;
    } catch (error) {
      this.logger.error('OpenAI API 호출 중 오류 발생:', error);
      return ''; // 오류 발생 시 빈 문자열 반환
    }
  }


  formatEstProfit(estProfit: ViewLlmPlayEstProfit[]): string {
    // 수익 기준으로 항목 정렬 (높은 수익부터)
    const sortedEstProfit = [...estProfit].sort((a, b) =>
      Number(b.estTotalProfit) - Number(a.estTotalProfit)
    );

    // 테이블 컬럼 너비 계산 (일관된 간격을 위해)
    const col1Width = 18; // 작품명
    const col2Width = 18; // 예상 총매출
    const col3Width = 18; // BEP
    const col4Width = 18; // 최종 예상 손익

    // 헤더 생성
    const header1 = '작품명'.padEnd(col1Width);
    const header2 = '예상 총매출'.padEnd(col2Width);
    const header3 = 'BEP (손익분기점)'.padEnd(col3Width);
    const header4 = '최종 예상 손익'.padEnd(col4Width);

    // 구분선 생성
    const divider = '-'.repeat(col1Width) + ' ' +
      '-'.repeat(col2Width) + ' ' +
      '-'.repeat(col3Width) + ' ' +
      '-'.repeat(col4Width);



    // 테이블 시작
    let table = [
      `\n\n*[ 최종 손익 전망 ] *`,
      '```',
      `${header1} ${header2} ${header3} ${header4}`,
      divider
    ];

    // 각 작품의 데이터 행 추가
    sortedEstProfit.forEach(item => {
      // 숫자 데이터 포맷팅
      const bep = this.formatNumber(Number(item.bep));
      const estTotalRevenue = this.formatNumber(Number(item.estTotalRevenue));
      const estTotalProfit = this.formatNumber(Number(item.estTotalProfit));

      // 손익에 +/- 표시 추가
      const estTotalProfitNum = Number(item.estTotalProfit);
      const profitPrefix = estTotalProfitNum >= 0 ? '+' : '';
      const formattedProfit = `${profitPrefix}${estTotalProfit}`;

      // 행 데이터 칸 너비에 맞게 조정
      const nameCol = item.liveName.padEnd(col1Width);
      const revenueCol = estTotalRevenue.padEnd(col2Width);
      const bepCol = bep.padEnd(col3Width);
      const profitCol = formattedProfit.padEnd(col4Width);

      // 행 추가
      table.push(`${nameCol} ${revenueCol} ${bepCol} ${profitCol}`);
    });

    // 테이블 닫기
    table.push('```');

    return table.join('\n');
  }

  async playWeeklyPaidshareReport() {
    try {
      const weeklyPaidshare = await this.viewLlmPlayWeeklyPaidshareRepository.find();
      const weeklyPaidshareMap = await this.formatWeeklyPaidshareWithTrendAnalysis(weeklyPaidshare);

      this.logger.debug(weeklyPaidshareMap);
      await this.slackService.sendMessage(weeklyPaidshareMap);

      return {
        code: 200,
        message: '주차별 평균 점유율 리포트 전송 완료',
        data: weeklyPaidshareMap,
      }
    } catch (e) {
      this.logger.error(e);

      return {
        code: 500,
        message: e.message,
      }
    }
  }

  async playGenerateTrendAnalysis(
    liveName: string,
    monthName: string,
    nextMonthName: string,
    weeklyData: { weekNumber: number, dateRange: string, paidShare: number }[]
  ): Promise<string> {
    try {
      // 점유율 데이터 준비
      const trendData = weeklyData.map(week =>
        `${week.weekNumber}주차 (${week.dateRange}): ${week.paidShare}%`
      ).join('\n');

      const prompt = `
공연 "${liveName}"의 ${monthName} 주차별 평균 점유율 데이터가 아래와 같습니다:

${trendData}

이 데이터를 바탕으로 점유율 추세를 분석하고, 다음을 포함한 한 줄 요약을 작성해주세요:
1. ${monthName}의 점유율 추세 (상승/하락/유지)
2. ${nextMonthName}을 위한 간략한 전략적 제안

다음 형식으로 작성해주세요:
"*${monthName} 후반으로 갈수록 점유율 [상승/하락/유지] 추세 → [간결한 전략적 제안]*"
문장 맨앞, 맨뒤에는 *을 반드시 포함해주세요.

위의 형식을 유지하면서,
[ 간결한 전략적 제안 ] 부분에는 아래 조건을 준수해주세요.
${this.promptRules}

최대 한 문장으로 간결하게 작성해주세요.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "당신은 공연 데이터 분석가입니다. 공연 점유율 데이터를 바탕으로 간결하고 통찰력 있는 분석을 제공합니다." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API 호출 중 오류 발생:', error);
      return `*${monthName} 데이터 분석 중 오류 발생 → 수동 검토 필요*`;
    }
  }


  formatWeeklyPaidshare(weeklyPaidshare: ViewLlmPlayWeeklyPaidshare[]): string {
    // 현재 날짜 구하기
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11 (0: 1월, 1: 2월, ...)
    const currentYear = now.getFullYear();

    // 지난달 구하기
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1; // 1월이면 지난달은 12월
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // 월 이름 배열
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    const lastMonthName = monthNames[lastMonth];
    const currentMonthName = monthNames[currentMonth];

    // 공연별로 데이터 그룹화
    const liveGroups = new Map<string, ViewLlmPlayWeeklyPaidshare[]>();

    weeklyPaidshare.forEach(item => {
      const key = item.liveName;
      if (!liveGroups.has(key)) {
        liveGroups.set(key, []);
      }
      liveGroups.get(key).push(item);
    });

    // 결과 메시지 생성
    let message = '';

    // 지난달 분석
    message += `*[ ${lastMonthName} 주차별 평균 점유율 (지난달 분석) ]*\n\n`;

    liveGroups.forEach((items, liveName) => {
      // 지난달 데이터 필터링
      const lastMonthItems = items.filter(item => {
        const startDate = new Date(item.weekStartDate);
        return startDate.getMonth() === lastMonth && startDate.getFullYear() === lastMonthYear;
      });

      // 주차별로 데이터 정렬
      lastMonthItems.sort((a, b) =>
        new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime()
      );

      if (lastMonthItems.length > 0) {
        message += `*<${liveName}>*\n`;

        // 해당 월의 주차들 계산
        lastMonthItems.forEach((item, index) => {
          const startDate = new Date(item.weekStartDate);
          const endDate = new Date(item.weekEndDate);

          const startDay = startDate.getDate();
          const startMonth = startDate.getMonth() + 1; // 월은 0부터 시작하므로 +1

          const endDay = endDate.getDate();
          const endMonth = endDate.getMonth() + 1; // 월은 0부터 시작하므로 +1

          // 점유율 소수점 반올림
          const paidShare = Math.round(Number(item.paidSharePercentage));

          // 시작일과 종료일 월이 다른 경우 처리
          const dateRangeText = startMonth === endMonth
            ? `${startMonth}/${startDay}~${startMonth}/${endDay}`
            : `${startMonth}/${startDay}~${endMonth}/${endDay}`;

          message += `${index + 1}주차 (${dateRangeText}): ${paidShare}%\n`;
        });

        message += `\n\n`;


        // // 추세 분석
        // const firstWeekShare = Number(lastMonthItems[0]?.paidSharePercentage || '0');
        // const lastWeekShare = Number(lastMonthItems[lastMonthItems.length - 1]?.paidSharePercentage || '0');

        // if (lastWeekShare > firstWeekShare) {
        //   message += `*${lastMonthName} 후반으로 갈수록 점유율 상승 추세 → ${currentMonthName} 유지 전략 필요*\n\n`;
        // } else if (lastWeekShare < firstWeekShare) {
        //   message += `*${lastMonthName} 후반으로 갈수록 점유율 하락 추세 → 원인 분석 및 회차별 대응 필요*\n\n`;
        // } else {
        //   message += `*${lastMonthName} 점유율 안정적 유지 → 현재 전략 지속 필요*\n\n`;
        // }
      }
    });

    message += `\n`;

    // 이번달 분석
    message += `*[ ${currentMonthName} 주차별 평균 점유율 (이번달 분석) ]*\n\n`;

    liveGroups.forEach((items, liveName) => {
      // 이번달 데이터 필터링
      const currentMonthItems = items.filter(item => {
        const startDate = new Date(item.weekStartDate);
        return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
      });

      // 주차별로 데이터 정렬
      currentMonthItems.sort((a, b) =>
        new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime()
      );

      if (currentMonthItems.length > 0) {
        message += `*<${liveName}>*\n`;

        // 해당 월의 주차들 계산
        currentMonthItems.forEach((item, index) => {
          const startDate = new Date(item.weekStartDate);
          const endDate = new Date(item.weekEndDate);

          const startDay = startDate.getDate();
          const startMonth = startDate.getMonth() + 1; // 월은 0부터 시작하므로 +1

          const endDay = endDate.getDate();
          const endMonth = endDate.getMonth() + 1; // 월은 0부터 시작하므로 +1

          // 점유율 소수점 반올림
          const paidShare = Math.round(Number(item.paidSharePercentage));

          // 시작일과 종료일 월이 다른 경우 처리
          const dateRangeText = startMonth === endMonth
            ? `${startMonth}/${startDay}~${startMonth}/${endDay}`
            : `${startMonth}/${startDay}~${endMonth}/${endDay}`;

          message += `${index + 1}주차 (${dateRangeText}): ${paidShare}%\n`;
        });

        message += `\n\n`;


        // // 추세 분석
        // if (currentMonthItems.length >= 2) {
        //   const firstWeekShare = Number(currentMonthItems[0]?.paidSharePercentage || '0');
        //   const lastWeekShare = Number(currentMonthItems[currentMonthItems.length - 1]?.paidSharePercentage || '0');

        //   if (lastWeekShare > firstWeekShare) {
        //     message += `*${currentMonthName} 점유율 상승 추세 → 현재 전략 지속 필요*\n\n`;
        //   } else if (lastWeekShare < firstWeekShare) {
        //     message += `*${currentMonthName} 점유율 하락 추세 → 즉각적인 마케팅 대응 필요*\n\n`;
        //   } else {
        //     message += `*${currentMonthName} 점유율 안정적 유지 → 현재 전략 유지*\n\n`;
        //   }
        // } else {
        //   // 이번달 데이터가 한 주차밖에 없는 경우
        //   message += `*${currentMonthName} 데이터가 충분하지 않음 → 지속적인 모니터링 필요*\n\n`;
        // }
      }
    });

    return message;
  }

  async formatWeeklyPaidshareWithTrendAnalysis(weeklyPaidshare: ViewLlmPlayWeeklyPaidshare[]): Promise<string> {
    try {
      // 현재 날짜 구하기
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-11 (0: 1월, 1: 2월, ...)
      const currentYear = now.getFullYear();

      // 지난달 구하기
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1; // 1월이면 지난달은 12월
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // 월 이름 배열
      const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
      const lastMonthName = monthNames[lastMonth];
      const currentMonthName = monthNames[currentMonth];

      // 추가 분석이 실패할 경우를 대비해 기본 메시지 먼저 생성
      const baseMessage = this.formatWeeklyPaidshare(weeklyPaidshare);

      try {
        // OpenAI API 사용한 추세 분석 시도
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextMonthName = monthNames[nextMonth];

        // 공연별로 데이터 그룹화
        const liveGroups = new Map<string, ViewLlmPlayWeeklyPaidshare[]>();

        weeklyPaidshare.forEach(item => {
          const key = item.liveName;
          if (!liveGroups.has(key)) {
            liveGroups.set(key, []);
          }
          liveGroups.get(key).push(item);
        });

        // 결과 메시지 생성
        let message = '';

        // 지난달 분석
        message += `*[ ${lastMonthName} 주차별 평균 점유율 (지난달 분석) ]*\n\n`;

        // 모든 공연의 분석을 병렬로 처리하기 위한 Promise 배열
        const analysisPromises = [];

        for (const [liveName, items] of liveGroups.entries()) {
          // 지난달 데이터 필터링
          const lastMonthItems = items.filter(item => {
            const startDate = new Date(item.weekStartDate);
            return startDate.getMonth() === lastMonth && startDate.getFullYear() === lastMonthYear;
          });

          // 주차별로 데이터 정렬
          lastMonthItems.sort((a, b) =>
            new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime()
          );

          if (lastMonthItems.length > 0) {
            let liveMessage = `*<${liveName}>*\n`;

            // 주차별 데이터 포맷팅
            const weeklyData = [];

            lastMonthItems.forEach((item, index) => {
              const startDate = new Date(item.weekStartDate);
              const endDate = new Date(item.weekEndDate);

              const startDay = startDate.getDate();
              const startMonth = startDate.getMonth() + 1; // 월은 0부터 시작하므로 +1

              const endDay = endDate.getDate();
              const endMonth = endDate.getMonth() + 1; // 월은 0부터 시작하므로 +1

              // 점유율 소수점 반올림
              const paidShare = Math.round(Number(item.paidSharePercentage));

              // 시작일과 종료일 월이 다른 경우 처리
              const dateRangeText = startMonth === endMonth
                ? `${startMonth}/${startDay}~${startMonth}/${endDay}`
                : `${startMonth}/${startDay}~${endMonth}/${endDay}`;

              liveMessage += `${index + 1}주차 (${dateRangeText}): ${paidShare}%\n`;

              weeklyData.push({
                weekNumber: index + 1,
                dateRange: dateRangeText,
                paidShare
              });
            });

            // LLM 분석 요청을 Promise 배열에 추가
            if (lastMonthItems.length >= 2) {
              const analysisPromise = this.playGenerateTrendAnalysis(
                liveName,
                lastMonthName,
                currentMonthName,
                weeklyData
              ).then(analysis => {
                return { type: 'last', liveName, message: liveMessage + analysis + '\n\n' };
              }).catch(error => {
                this.logger.error(`분석 중 오류 발생 (${liveName}, ${lastMonthName}): ${error.message}`);
                return { type: 'last', liveName, message: liveMessage + '\n\n' };
              });

              analysisPromises.push(analysisPromise);
            } else {
              analysisPromises.push(Promise.resolve({
                type: 'last',
                liveName,
                message: liveMessage + `*${lastMonthName} 데이터가 충분하지 않음 → 지속적인 모니터링 필요*\n\n`
              }));
            }
          }
        }

        // 이번달 분석
        message += `\n*[ ${currentMonthName} 주차별 평균 점유율 (이번달 분석) ]*\n\n`;

        for (const [liveName, items] of liveGroups.entries()) {
          // 이번달 데이터 필터링
          const currentMonthItems = items.filter(item => {
            const startDate = new Date(item.weekStartDate);
            return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
          });

          // 주차별로 데이터 정렬
          currentMonthItems.sort((a, b) =>
            new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime()
          );

          if (currentMonthItems.length > 0) {
            let liveMessage = `*<${liveName}>*\n`;

            // 주차별 데이터 포맷팅
            const weeklyData = [];

            currentMonthItems.forEach((item, index) => {
              const startDate = new Date(item.weekStartDate);
              const endDate = new Date(item.weekEndDate);

              const startDay = startDate.getDate();
              const startMonth = startDate.getMonth() + 1; // 월은 0부터 시작하므로 +1

              const endDay = endDate.getDate();
              const endMonth = endDate.getMonth() + 1; // 월은 0부터 시작하므로 +1

              // 점유율 소수점 반올림
              const paidShare = Math.round(Number(item.paidSharePercentage));

              // 시작일과 종료일 월이 다른 경우 처리
              const dateRangeText = startMonth === endMonth
                ? `${startMonth}/${startDay}~${startMonth}/${endDay}`
                : `${startMonth}/${startDay}~${endMonth}/${endDay}`;

              liveMessage += `${index + 1}주차 (${dateRangeText}): ${paidShare}%\n`;

              weeklyData.push({
                weekNumber: index + 1,
                dateRange: dateRangeText,
                paidShare
              });
            });

            // LLM 분석 요청을 Promise 배열에 추가
            if (currentMonthItems.length >= 2) {
              const analysisPromise = this.playGenerateTrendAnalysis(
                liveName,
                currentMonthName,
                nextMonthName,
                weeklyData
              ).then(analysis => {
                return { type: 'current', liveName, message: liveMessage + analysis + '\n\n' };
              }).catch(error => {
                this.logger.error(`분석 중 오류 발생 (${liveName}, ${currentMonthName}): ${error.message}`);
                return { type: 'current', liveName, message: liveMessage + '\n\n' };
              });

              analysisPromises.push(analysisPromise);
            } else {
              analysisPromises.push(Promise.resolve({
                type: 'current',
                liveName,
                message: liveMessage + `*${currentMonthName} 데이터가 충분하지 않음 → 지속적인 모니터링 필요*\n\n`
              }));
            }
          }
        }

        // 모든 분석 결과가 완료될 때까지 기다림
        const analysisResults = await Promise.all(analysisPromises);

        // 지난달 분석 먼저, 그 다음 이번달 분석 순서로 메시지 구성
        const lastMonthAnalyses = analysisResults.filter(result => result.type === 'last');
        const currentMonthAnalyses = analysisResults.filter(result => result.type === 'current');

        let finalMessage = `*[ ${lastMonthName} 주차별 평균 점유율 (지난달 분석) ]*\n\n`;
        lastMonthAnalyses.forEach(analysis => {
          finalMessage += analysis.message;
        });

        finalMessage += `\n*[ ${currentMonthName} 주차별 평균 점유율 (이번달 분석) ]*\n\n`;
        currentMonthAnalyses.forEach(analysis => {
          finalMessage += analysis.message;
        });

        return finalMessage;
      } catch (error) {
        // 추세 분석 중 오류 발생 시 기본 메시지 반환
        this.logger.error(`주차별 평균 점유율 분석 중 오류 발생: ${error.message}`);
        return baseMessage;
      }
    } catch (baseError) {
      // 기본 메시지 생성 중에도 오류 발생 시
      this.logger.error(`기본 주차별 평균 점유율 데이터 포맷팅 중 오류 발생: ${baseError.message}`);
      return `*주차별 평균 점유율 리포트 생성 중 오류가 발생했습니다.*`;
    }
  }

  async concertTotalSalesReport() {
    try {

      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      let message = `*[${month}/${day}(${this.dayOfWeekKorean()}) 일간 공연 현황]*\n\n`;

      const conAllOverview = await this.viewConAllOverviewRepository.find();
      const totalSalesMessage = this.concertFormatConcertTotalSalesReport(conAllOverview);

      const conAllDaily = await this.viewConAllDailyRepository.find();
      const salesRateOfChangeMessage = this.concertFormatSalesRateOfChange(conAllDaily);

      const conBep = await this.viewConBepRepository.find();
      const estRemainingSeatsMessage = this.concertFormatEstRemainingSeatsReport(conBep);

      const conTargetSales = await this.viewConTargetSalesRepository.find();
      const targetSalesMessage = this.concertFormatTargetSalesReport(conTargetSales);

      const conWeeklyMarketingCalendar = await this.viewConWeeklyMarketingCalendarRepository.find();
      const weeklyMarketingCalendarMessage = this.concertFormatWeeklyMarketingCalendarReport(conWeeklyMarketingCalendar);

      const conEstProfit = await this.viewConEstProfitRepository.find();
      const estProfitMessage = this.concertFormatEstProfitReport(conEstProfit);

      message += totalSalesMessage;
      message += `\n`;
      message += salesRateOfChangeMessage;
      message += `\n\n\n`;
      message += estRemainingSeatsMessage;
      message += `\n`;
      message += targetSalesMessage;
      message += `\n`;
      message += weeklyMarketingCalendarMessage;
      message += `\n`;
      message += estProfitMessage;

      await this.slackService.sendMessage(message);



      return {
        code: 200,
        message: '콘서트 일간 공연 현황 리포트 전송 완료',
        data: message,
      }

    } catch (error) {
      this.logger.error(`콘서트 총 매출 리포트 생성 중 오류 발생: ${error.message}`);
      return {
        code: 500,
        message: '콘서트 총 매출 리포트 생성 중 오류가 발생했습니다.',
        data: error.message,
      }
    }
  }

  concertFormatConcertTotalSalesReport(conAllOverview: ViewConAllOverview[]) {
    const yesterdaySales = conAllOverview[0].yesterdaySales;
    const accumulatedSales = conAllOverview[0].accumulatedSales;
    const weeklySales = conAllOverview[0].weeklySales;
    const dailyAvgSales = conAllOverview[0].dailyAvgSales;

    const message = `*종합 총 매출*\n*어제 매출: ${this.formatNumber(yesterdaySales)}\n*누적 매출: ${this.formatNumber(accumulatedSales)}\n*주간 매출: ${this.formatNumber(weeklySales)}\n*일평균 매출: ${this.formatNumber(dailyAvgSales)}\n
    `;

    return message;
  }

  concertFormatSalesRateOfChange(conAllDaily: ViewConAllDaily[]) {
    this.logger.log('매출 증감률 계산 시작');

    // 오늘 날짜 가져오기 (KST 기준)
    const today = new Date();

    // liveName으로 그룹화
    const groupedByLiveName = conAllDaily.reduce((acc, item) => {
      if (!acc[item.liveName]) {
        acc[item.liveName] = [];
      }
      acc[item.liveName].push(item);
      return acc;
    }, {} as Record<string, ViewConAllDaily[]>);

    let message = `*전일 대비 매출 증감률*\n`;

    // 각 콘서트별로 증감률 계산
    Object.entries(groupedByLiveName).forEach(([liveName, items]) => {
      message += `* ${liveName}: `;

      // 날짜순으로 정렬 (내림차순으로 - 최신 날짜가 먼저 오도록)
      const sortedItems = items.sort((a, b) =>
        new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
      );

      // 날짜가 오늘인 데이터 찾기
      const todayItem = sortedItems.find(item => {
        const itemDate = new Date(item.recordDate);
        return itemDate.toDateString() === today.toDateString();
      });

      if (!todayItem) {
        message += `오늘 데이터 없음\n`;
        return;
      }

      // 전일 데이터 찾기 (오늘 날짜보다 이전인 첫 번째 데이터)
      const prevItem = sortedItems.find(item => {
        const itemDate = new Date(item.recordDate);
        return itemDate.getTime() < new Date(todayItem.recordDate).getTime();
      });

      if (!prevItem) {
        message += `이전 데이터 없음 \n`;
        return;
      }

      const changeAmount = todayItem.dailySalesAmount - prevItem.dailySalesAmount;

      const sign = changeAmount > 0 ? '🔺' : '🔻';

      message += ` ${sign}${this.formatNumber(changeAmount)}원`;
    });

    this.logger.log('매출 증감률 계산 완료');
    return message;
  }

  concertFormatEstRemainingSeatsReport(conBep: ViewConBep[]) {
    let message = `*최종 잔여석*\n`;

    const groupedByLiveName = conBep.reduce((acc, item) => {
      if (!acc[item.liveName]) {
        acc[item.liveName] = [];
      }
      acc[item.liveName].push(item);
      return acc;
    }, {} as Record<string, ViewConBep[]>);

    Object.entries(groupedByLiveName).forEach(([liveName, items]) => {
      message += `*${liveName}\n`;

      items.forEach(item => {
        message += `${item.seatClass}석 ${this.formatNumber(Math.round(item.estFinalRemaining))}석\n`;
      });

      message += `\n`;
    });

    return message;
  }

  concertFormatTargetSalesReport(conTargetSales: ViewConTargetSales[]) {
    let message = `*목표 매출 달성률*\n`;

    conTargetSales.forEach(item => {
      message += `<${item.liveName}>\n`;

      // 숫자 포맷팅 적용 및 달성률 소수점 처리
      const formattedBep = this.formatNumber(Math.round(item.targetSales));
      const formattedSalesAcc = this.formatNumber(Math.round(item.salesAcc));

      // 달성률을 소수점 없이 정수로 표시 (반올림)
      const formattedRatio = Math.round(item.targetRatio * 100);

      message += `목표 매출 : ${formattedBep}원 / 현재 매출 : ${formattedSalesAcc}원 / 달성률 : ${formattedRatio}%`;
      message += `\n\n`;
    });

    return message;
  }

  concertFormatWeeklyMarketingCalendarReport(conWeeklyMarketingCalendar: ViewConWeeklyMarketingCalendar[]) {
    let message = `*금주 진행 예정 세일즈 마케팅 및 프로모션*\n`;

    conWeeklyMarketingCalendar.forEach(item => {

      const startDate = `${item.weekStartDate.getFullYear()}.${item.weekStartDate.getMonth() + 1}.${item.weekStartDate.getDate()}`;
      const endDate = `${item.weekEndDate.getFullYear()}.${item.weekEndDate.getMonth() + 1}.${item.weekEndDate.getDate()}`;

      message += `<${item.liveName}>\n`;
      message += `*${startDate} ~ ${endDate}: ${item.salesMarketing} / ${item.promotion} / ${item.etc}`;
      message += `\n\n`;
    });

    return message;
  }

  concertFormatEstProfitReport(conEstProfit: ViewConEstProfit[]) {
    const today = new Date();
    const month = today.getMonth() + 1;

    let message = `*최종 손익 전망(${month}월 기준)*\n\n\`\`\`\n`;

    // 열 제목
    message += `작품명                                   |    예상 총매출    |  BEP(손익분기점)  |    최종 예상손익\n`;
    message += `---------------------------------------|-----------------|-----------------|------------------\n`;

    // 데이터 행 추가
    conEstProfit.forEach(item => {
      const formattedEstSales = this.formatNumber(Number(item.estSales));
      const formattedBep = this.formatNumber(Number(item.bep));
      const formattedFinalProfit = this.formatNumber(Number(item.finalProfit));

      // 각 열의 너비를 고정하고 정렬
      message += `${item.liveName.padEnd(37)} | ${formattedEstSales.padStart(13)}원 | ${formattedBep.padStart(13)}원 | ${formattedFinalProfit.padStart(14)}원\n`;
    });

    message += `\`\`\``;
    return message;
  }


  dayOfWeekKorean = (): string => {
    const today = new Date();
    const dayNames = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    return dayNames[today.getDay()];
  }

  weekNumber = (): string => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const currentYear = today.getFullYear();

    // 해당 월의 첫 날
    const firstDayOfMonth = new Date(currentYear, today.getMonth(), 1);

    // 해당 월의 첫 날이 속한 주의 월요일 찾기
    let firstMonday = new Date(firstDayOfMonth);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0은 일요일, 1은 월요일, ...

    if (dayOfWeek === 0) { // 일요일이면 다음 날이 월요일
      firstMonday.setDate(firstDayOfMonth.getDate() + 1);
    } else if (dayOfWeek > 1) { // 화요일~토요일이면 이전 월요일로
      firstMonday.setDate(firstDayOfMonth.getDate() - (dayOfWeek - 1));
    }

    // 첫 월요일이 이전 달이면 해당 월의 첫 번째 월요일 찾기
    if (firstMonday.getMonth() !== today.getMonth()) {
      firstMonday = new Date(currentYear, today.getMonth(), 1);
      // 첫 번째 월요일 찾기
      while (firstMonday.getDay() !== 1) {
        firstMonday.setDate(firstMonday.getDate() + 1);
      }
    }

    // 현재 날짜와 첫 월요일 사이의 일수 계산
    const diffTime = Math.abs(today.getTime() - firstMonday.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 주차 계산 (월요일 기준)
    const weekNumber = Math.floor(diffDays / 7) + 1;

    // 월 한글 표기 (예: 4월)
    const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
    const koreanMonth = monthNames[today.getMonth()];

    return `${koreanMonth} ${weekNumber}주차`;
  }

  formatNumber = (num: number): string => {
    if (num === null) {
      return '0';
    }

    return num.toLocaleString('ko-KR');
  };
}
