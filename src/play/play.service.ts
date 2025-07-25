import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUploadModel } from 'src/upload/entities/file-upload.entity';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { PlayShowSaleModel } from './entities/play-show-sale.entity';
import { PlayTicketSaleModel } from './entities/play-ticket-sale.entity';
// 연극/뮤지컬 대시보드용 뷰 엔티티들 import
import { ViewLlmPlayWeeklyA } from 'src/report/entities/view-llm-play-weekly-a.entity';
import { ViewLlmPlayDaily } from 'src/report/entities/view-llm-play-daily.entity';
import { ViewLlmPlayWeeklyPaidshare } from 'src/report/entities/view_llm_play_weekly_paidshare.entity';
// 추가 뷰 엔티티들
import { ViewPlayAllShowtime } from 'src/report/entities/view-play-all-showtime.entity';
import { ViewPlayMonthlyAll } from 'src/report/entities/view-play-monthly-all.entity';
import { ViewPlayMonthlyRespective } from 'src/report/entities/view-play-monthly-respective.entity';
import { ViewPlayOverallRevenueAnalysis } from 'src/report/entities/view-play-overall-revenue-analysis.entity';
import { ViewPlayRevenueByCast } from 'src/report/entities/view-play-revenue-by-cast.entity';

@Injectable()
export class PlayService {
  private readonly logger = new Logger(PlayService.name);

  constructor(
    @InjectRepository(FileUploadModel)
    private readonly uploadRepository: Repository<FileUploadModel>,
    @InjectRepository(PlayTicketSaleModel)
    private readonly playDailySaleRepository: Repository<PlayTicketSaleModel>,
    @InjectRepository(PlayShowSaleModel)
    private readonly playTurnSaleRepository: Repository<PlayShowSaleModel>,
    // 연극/뮤지컬 대시보드용 뷰 레포지토리들
    @InjectRepository(ViewLlmPlayWeeklyA)
    private readonly viewLlmPlayWeeklyARepository: Repository<ViewLlmPlayWeeklyA>,
    @InjectRepository(ViewLlmPlayDaily)
    private readonly viewLlmPlayDailyRepository: Repository<ViewLlmPlayDaily>,
    @InjectRepository(ViewLlmPlayWeeklyPaidshare)
    private readonly viewLlmPlayWeeklyPaidshareRepository: Repository<ViewLlmPlayWeeklyPaidshare>,
    // 추가 뷰 레포지토리들
    @InjectRepository(ViewPlayAllShowtime)
    private readonly viewPlayAllShowtimeRepository: Repository<ViewPlayAllShowtime>,
    @InjectRepository(ViewPlayMonthlyAll)
    private readonly viewPlayMonthlyAllRepository: Repository<ViewPlayMonthlyAll>,
    @InjectRepository(ViewPlayMonthlyRespective)
    private readonly viewPlayMonthlyRespectiveRepository: Repository<ViewPlayMonthlyRespective>,
    @InjectRepository(ViewPlayOverallRevenueAnalysis)
    private readonly viewPlayOverallRevenueAnalysisRepository: Repository<ViewPlayOverallRevenueAnalysis>,
    @InjectRepository(ViewPlayRevenueByCast)
    private readonly viewPlayRevenueByCastRepository: Repository<ViewPlayRevenueByCast>,
  ) { }

  /**
   * 연극/뮤지컬 월별 전체 매출 조회
   * 최근 1년간 월별 매출 통계 및 증감률
   * ✅ 콘서트 데이터 제외
   */
  async getPlayMonthlySummary(): Promise<ViewPlayMonthlyAll[]> {
    try {
      const data = await this.viewPlayMonthlyAllRepository.find({
        order: {
          month_str: 'DESC'
        }
      });
        
      this.logger.debug(`연극/뮤지컬 월별 전체 매출 ${data.length}건 조회 완료`);
      return data;
    } catch (error) {
      this.logger.error('연극/뮤지컬 월별 전체 매출 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 연극/뮤지컬 월별 공연별 매출 조회
   * 최근 1년간 월별 각 공연의 매출 통계
   * ✅ 콘서트 데이터 자동 제외 (뷰에서 처리)
   */
  async getPlayMonthlyByPerformance(): Promise<ViewPlayMonthlyRespective[]> {
    try {
      const data = await this.viewPlayMonthlyRespectiveRepository.find({
        order: {
          month: 'DESC',
          performance_name: 'ASC',
        },
        take: 300,
      });

      this.logger.debug(`연극/뮤지컬 월별 공연별 매출 ${data.length}건 조회 완료`);
      return data;
    } catch (error) {
      this.logger.error('연극/뮤지컬 월별 공연별 매출 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 연극/뮤지컬 매출 분석 조회
   * 총 매출, 목표 대비 실적, 최근 일자 매출 분석
   * ✅ 콘서트 데이터 자동 제외 (뷰에서 처리)
   */
  async getPlayRevenueAnalysis(): Promise<ViewPlayOverallRevenueAnalysis[]> {
    try {
      const data = await this.viewPlayOverallRevenueAnalysisRepository.find({
        order: {
          liveId: 'ASC',
        },
      });

      this.logger.debug(`연극/뮤지컬 매출 분석 ${data.length}건 조회 완료`);
      return data;
    } catch (error) {
      this.logger.error('연극/뮤지컬 매출 분석 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 연극/뮤지컬 캐스트별 매출 조회
   * 캐스트별 매출 실적 및 공연 횟수
   * ✅ 콘서트 데이터 자동 제외 (뷰에서 처리)
   */
  async getPlayCastRevenue(): Promise<ViewPlayRevenueByCast[]> {
    try {
      const data = await this.viewPlayRevenueByCastRepository.find({
        order: {
          totalpaidseatsales: 'DESC',
        },
      });

      this.logger.debug(`연극/뮤지컬 캐스트별 매출 ${data.length}건 조회 완료`);
      return data;
    } catch (error) {
      this.logger.error('연극/뮤지컬 캐스트별 매출 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 연극/뮤지컬 전체 공연 일정 조회
   * 모든 공연 일정과 상세 정보
   * ✅ 콘서트 데이터 제외
   */
  async getPlayAllShowtime(): Promise<ViewPlayAllShowtime[]> {
    try {
      // Raw query로 콘서트 제외 필터링
      const data = await this.viewPlayAllShowtimeRepository
        .createQueryBuilder('showtime')
        .innerJoin('live_model', 'live', 'showtime."liveId_" = live."liveId"')
        .where('live.category != :category', { category: '콘서트' })
        .andWhere('live."isLive" = :isLive', { isLive: true })
        .orderBy('showtime."showDateTime"', 'DESC')
        .addOrderBy('showtime."liveName"', 'ASC')
        .getMany();
        
      this.logger.debug(`연극/뮤지컬 전체 공연 일정 ${data.length}건 조회 완료 (콘서트 제외)`);
      return data;
    } catch (error) {
      this.logger.error('연극/뮤지컬 전체 공연 일정 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 연극/뮤지컬 주간 목표 대비 실적 데이터 조회
   * 목표점유율, 실제점유율, 목표매출, 실제매출 비교
   * ✅ 콘서트 데이터 제외
   */
  async getPlayWeeklyOverview(): Promise<ViewLlmPlayWeeklyA[]> {
    try {
      // Raw query로 콘서트 제외 필터링 (alias 소문자로 변경)
      const data = await this.viewLlmPlayWeeklyARepository
        .createQueryBuilder('weeklya')
        .innerJoin('live_model', 'live', 'weeklya."공연ID" = live."liveId"')
        .where('live.category != :category', { category: '콘서트' })
        .andWhere('live."isLive" = :isLive', { isLive: true })
        .getMany();
        
      this.logger.debug(`연극/뮤지컬 주간 개요 데이터 ${data.length}건 조회 완료 (콘서트 제외)`);
      return data;
    } catch (error) {
      this.logger.error('연극/뮤지컬 주간 개요 데이터 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 연극/뮤지컬 일일 상세 데이터 조회
   * 공연별 매출, 좌석 정보, 캐스트 정보
   * ✅ 콘서트 데이터 제외
   */
  async getPlayDailyDetails(): Promise<ViewLlmPlayDaily[]> {
    try {
      // Raw query로 콘서트 제외 필터링
      const data = await this.viewLlmPlayDailyRepository
        .createQueryBuilder('daily')
        .innerJoin('live_model', 'live', 'daily."liveId_" = live."liveId"')
        .where('live.category != :category', { category: '콘서트' })
        .andWhere('live."isLive" = :isLive', { isLive: true })
        .orderBy('daily."latestRecordDate"', 'DESC')
        .addOrderBy('daily."liveName"', 'ASC')
        .getMany();
        
      this.logger.debug(`연극/뮤지컬 일일 상세 데이터 ${data.length}건 조회 완료 (콘서트 제외)`);
      return data;
    } catch (error) {
      this.logger.error('연극/뮤지컬 일일 상세 데이터 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 연극/뮤지컬 유료 점유율 데이터 조회
   * 주간별 유료 객석 점유율 정보
   * ✅ 콘서트 데이터 제외
   */
  async getPlayOccupancyRate(): Promise<ViewLlmPlayWeeklyPaidshare[]> {
    try {
      // Raw query로 콘서트 제외 필터링
      const data = await this.viewLlmPlayWeeklyPaidshareRepository
        .createQueryBuilder('paidshare')
        .innerJoin('live_model', 'live', 'paidshare."공연 ID" = live."liveId"')
        .where('live.category != :category', { category: '콘서트' })
        .andWhere('live."isLive" = :isLive', { isLive: true })
        .orderBy('paidshare."주 시작일"', 'DESC')
        .addOrderBy('paidshare."공연명"', 'ASC')
        .getMany();
        
      this.logger.debug(`연극/뮤지컬 유료 점유율 데이터 ${data.length}건 조회 완료 (콘서트 제외)`);
      return data;
    } catch (error) {
      this.logger.error('연극/뮤지컬 유료 점유율 데이터 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 연극/뮤지컬 대시보드 첫 번째 페이지 통합 데이터 조회
   * 목표 대비 실적, 일일 상세, 유료 점유율을 통합하여 반환
   */
  async getPlaySummary() {
    try {
      const [weeklyOverview, dailyDetails, occupancyRate] = await Promise.all([
        this.getPlayWeeklyOverview(),
        this.getPlayDailyDetails(),
        this.getPlayOccupancyRate()
      ]);

      const summary = {
        weeklyOverview,    // 카테고리별 총계 (목표 대비 실적)
        dailyDetails,      // 공연별 상세 정보
        occupancyRate,     // 유료점유율 차트 데이터
        timestamp: new Date()
      };

      this.logger.debug('연극/뮤지컬 통합 대시보드 데이터 조회 완료');
      return summary;
    } catch (error) {
      this.logger.error('연극/뮤지컬 통합 대시보드 데이터 조회 실패:', error);
      throw error;
    }
  }


  isErrorCell(cell) {

    if (!cell || !cell.t) {
      return false;
    }

    return cell.t.toString() === 'e' || cell.w === '#REF!';
  }

  async getCellValue(cell) {
    if (!cell) {
      return null;
    }

    if (this.isErrorCell(cell)) {
      throw new Error('엑셀 데이터에 오류가 존재합니다.');
    }

    return cell ? cell.v : null;
  }

  async uploadExcelData(file, playUpload: FileUploadModel) {
    const queryRunner = this.playDailySaleRepository.manager.connection.createQueryRunner();

    try {
      await queryRunner.startTransaction(); // 트랜잭션 시작

      // 엑셀 파일을 읽어옵니다.
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const fileDate = fileName.split('_')[0];

      let targetDate: Date;

      if (fileDate.startsWith('20') === false) {
        const fixFileDate = '20' + fileDate;
        const formattedFileDate = fixFileDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        targetDate = Date.parse(formattedFileDate) ? new Date(formattedFileDate) : null;
      } else {
        const formattedFileDate = fileDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        targetDate = Date.parse(formattedFileDate) ? new Date(formattedFileDate) : null;
      }

      targetDate.setHours(0);
      targetDate.setMinutes(0);
      targetDate.setSeconds(0);
      targetDate.setMilliseconds(0);

      const playId = fileName.split('_')[1];
      const playName = fileName.split('_')[2];

      this.logger.debug(`파일명: ${fileName}`);
      this.logger.debug(`날짜: ${fileDate}`);
      this.logger.debug(`타겟날짜: ${targetDate}`);
      this.logger.debug(`플레이 ID: ${playId}`);

      // "Daily" 시트를 찾습니다.
      const dailySheetName = 'Daily';
      if (workbook.SheetNames.includes(dailySheetName)) {

        const dailySheet = workbook.Sheets[dailySheetName];


        const row2 = XLSX.utils.sheet_to_json(dailySheet, {
          header: 1,
          range: 1,
          defval: null,
        })[0];

        const dashColumns = [];
        if (row2) {
          Object.keys(row2).forEach((key) => {
            const value = row2[key];
            if (value && typeof value === 'string' && value.startsWith('dash_')) {
              dashColumns.push({ column: parseInt(key), value });
            }
          });
        }

        if (dashColumns.length === 0) {
          this.logger.debug('"Daily" 시트의 2행 중 "dash_"으로 시작하는 셀을 찾을 수 없습니다.');
          return { status: false, message: 'Daily 시트의 2행 중 "dash_"으로 시작하는 셀을 찾을 수 없습니다.' };
        }

        this.logger.debug(`"Daily" 시트의 2행 중 "dash_"으로 시작하는 셀의 위치 및 값을 로그로 출력: ${JSON.stringify(dashColumns)}`);

        let dashDepositSeatColumnIndexList = [];

        await dashColumns.find((col) => {
          if (col.value.includes('dash_seat_deposit')) {
            const seatName = col.value.split('_')[3];
            const result = { seatName: seatName, column: col.column }; // seatName과 column을 매핑
            dashDepositSeatColumnIndexList.push(result);
          }
        });



        const dashDateColumn = dashColumns.find(col => col.value === 'dash_date');
        const dashDepositTotColumn = dashColumns.find(col => col.value === 'dash_seat_deposit_tot');
        const dashDepositSalesColumn = dashColumns.find(col => col.value === 'dash_seat_deposit_sales');
        // const dashMarketingColumn = dashColumns.find(col => col.value === 'dash_marketing');

        if (!dashDateColumn) {
          this.logger.debug('"dash_date" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_date 열을 찾을 수 없습니다.' };
        } else if (!dashDepositTotColumn) {
          this.logger.debug('"dash_seat_deposit_tot" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_seat_deposit_tot 열을 찾을 수 없습니다.' };
        } else if (!dashDepositSalesColumn) {
          this.logger.debug('"dash_seat_deposit_sales" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_seat_deposit_sales 열을 찾을 수 없습니다.' };
        } else if (dashDepositSeatColumnIndexList.length === 0) {
          this.logger.debug('"dash_seat_deposit" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_seat_deposit 열을 찾을 수 없습니다.' };
        }

        const dashDateColumnLetter = XLSX.utils.encode_col(dashDateColumn.column);
        const dashDepositTotColumnLetter = XLSX.utils.encode_col(dashDepositTotColumn.column);
        const dashDepositSalesColumnLetter = XLSX.utils.encode_col(dashDepositSalesColumn.column);
        // const dashMarketingColumnLetter = XLSX.utils.encode_col(dashMarketingColumn.column);

        if (dashDateColumn) {
          const dashDateColumnIndex = dashDateColumn.column;
          const columnLetter = XLSX.utils.encode_col(dashDateColumnIndex);

          // 4. "dash_date" 열에서 YYYY.mm.dd 형식의 데이터를 찾습니다.
          const rows = XLSX.utils.sheet_to_json(dailySheet, {
            header: 1,
            range: `${columnLetter}1:${columnLetter}${dailySheet['!ref'].split(':')[1].replace(/[A-Za-z]/g, '')}`,
            defval: null,
          });



          let excelDateList = [];

          await Promise.all(rows.map(async (row, index) => {

            const dateValueCell = row[0];
            if (dateValueCell && typeof dateValueCell === 'number') {
              const excelDate = dateValueCell;



              let date = new Date((excelDate - 25569) * 86400 * 1000);
              const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
              date.setHours(0);
              date.setMinutes(0);
              date.setSeconds(0);
              date.setMilliseconds(0);


              if (date <= targetDate) {

                excelDateList.push(date);

                const depositTotCell = dailySheet[`${dashDepositTotColumnLetter}${index + 1}`];
                const depositSalesCell = dailySheet[`${dashDepositSalesColumnLetter}${index + 1}`];
                // const marketingCell = dailySheet[`${dashMarketingColumnLetter}${index + 1}`];

                const [depositTotValue, depositSalesValue] = await Promise.all([
                  this.getCellValue(depositTotCell),
                  this.getCellValue(depositSalesCell),
                ]);

                // Get deposit seat values for seatA, seatR, seatS
                let seatA = null, seatR = null, seatS = null, seatVip = null, badSeatA = null, badSeatR = null, badSeatS = null, disableSeat = null;
                for (const col of dashDepositSeatColumnIndexList) {
                  const seatCell = dailySheet[`${XLSX.utils.encode_col(col.column)}${index + 1}`];

                  const cellValue = await this.getCellValue(seatCell);


                  if (col.seatName === 'a') seatA = cellValue;
                  if (col.seatName === 'r') seatR = cellValue;
                  if (col.seatName === 's') seatS = cellValue;
                  if (col.seatName === 'vip') seatVip = cellValue;
                  if (col.seatName === 'bada') badSeatA = cellValue;
                  if (col.seatName === 'badr') badSeatR = cellValue;
                  if (col.seatName === 'bads') badSeatS = cellValue;
                  if (col.seatName === 'disable') disableSeat = cellValue;
                }

                if (depositTotCell && depositSalesCell) {
                  // this.logger.debug(`날짜: ${date}, depositTotCell: ${depositTotCell.v}, depositSalesCell: ${depositSalesCell.v}, seatA: ${seatA}, seatR: ${seatR}, seatS: ${seatS}, marketingCell: ${marketingCell?.v ?? null}`);

                  const newDalySale = this.playDailySaleRepository.create({
                    playUpload,
                    recordDate: targetDate,
                    liveId: playId,
                    salesDate: date,
                    sales: depositSalesValue,
                    seatTot: depositTotValue,
                    seatVip: seatVip,
                    seatA: seatA,
                    seatR: seatR,
                    seatS: seatS,
                    badSeatA: badSeatA,
                    badSeatR: badSeatR,
                    badSeatS: badSeatS,
                    disableSeat: disableSeat,
                    // marketing: marketingCell?.v ?? null,
                  });

                  await queryRunner.manager.save(newDalySale); // 트랜잭션에서 저장
                } else {
                  this.logger.debug(`Daily 시트의 필요 데이터가 비어 있습니다.(날짜 : ${date})`);
                  return { status: false, message: '필요 데이터가 비어 있습니다.' };
                }
              }
            }
          }));

          this.logger.debug(`excelDateList: ${excelDateList}`);

        } else {
          this.logger.debug('"dash_date" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_date 열을 찾을 수 없습니다.' };
        }
      } else {
        this.logger.debug('"Daily" 시트를 찾을 수 없습니다.');
        return { status: false, message: 'Daily 시트를 찾을 수 없습니다.' };
      }

      // "회차별판매" 시트를 찾습니다.
      const turnSheetName = '회차별판매';
      if (workbook.SheetNames.includes(turnSheetName)) {

        const turnSheet = workbook.Sheets[turnSheetName];


        const row2 = XLSX.utils.sheet_to_json(turnSheet, {
          header: 1,
          range: 1,
          defval: null,
        })[0];

        const dashColumns = [];
        if (row2) {
          Object.keys(row2).forEach((key) => {
            const value = row2[key];
            if (value && typeof value === 'string' && value.startsWith('dash_')) {
              dashColumns.push({ column: parseInt(key), value });
            }
          });
        }

        if (dashColumns.length === 0) {
          this.logger.debug('"회차별판매" 시트의 2행 중 "dash_"으로 시작하는 셀을 찾을 수 없습니다.');
          return { status: false, message: '회차별판매 시트의 2행 중 "dash_"으로 시작하는 셀을 찾을 수 없습니다.' };
        }

        this.logger.debug(`"회차별판매" 시트의 2행 중 "dash_"으로 시작하는 셀의 위치 및 값을 로그로 출력: ${JSON.stringify(dashColumns)}`);

        let dashPaidSeatColumnIndexList = [];
        let dashInviteSeatColumnIndexList = [];
        let dashCastColumnIndexList = [];

        await dashColumns.find((col) => {
          if (col.value.includes('dash_seat_paid')) {
            const seatName = col.value.split('_')[3];
            const result = { seatName: seatName, column: col.column }; // seatName과 column을 매핑
            dashPaidSeatColumnIndexList.push(result);
          } else if (col.value.includes('dash_seat_invite')) {
            const seatName = col.value.split('_')[3];
            const result = { seatName: seatName, column: col.column }; // seatName과 column을 매핑
            dashInviteSeatColumnIndexList.push(result);
          } else if (col.value.includes('dash_cast')) {
            const result = { castName: 'cast', column: col.column }; // castName과 column을 매핑
            dashCastColumnIndexList.push(result);
          }
        });

        const dashDateColumn = dashColumns.find(col => col.value === 'dash_date');
        const dashTimeColumn = dashColumns.find(col => col.value === 'dash_time');
        const dashPaidTotColumn = dashColumns.find(col => col.value === 'dash_seat_paid_tot');
        const dashPaidSalesColumn = dashColumns.find(col => col.value === 'dash_seat_paid_sales');
        const dashInviteSeatTotColumn = dashColumns.find(col => col.value === 'dash_seat_invite_tot');
        const dsshShareDepositColumn = dashColumns.find(col => col.value === 'dash_share_deposit');
        const dashSharePaidColumn = dashColumns.find(col => col.value === 'dash_share_paid');
        const dashShareFreeColumn = dashColumns.find(col => col.value === 'dash_share_free');

        if (!dashDateColumn) {
          this.logger.debug('"dash_date" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_date 열을 찾을 수 없습니다.' };
        } else if (!dashTimeColumn) {
          this.logger.debug('"dash_time" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_time 열을 찾을 수 없습니다.' };
        } else if (!dashPaidTotColumn) {
          this.logger.debug('"dash_seat_paid_tot" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_seat_paid_tot 열을 찾을 수 없습니다.' };
        } else if (!dashPaidSalesColumn) {
          this.logger.debug('"dash_seat_paid_sales" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_seat_paid_sales 열을 찾을 수 없습니다.' };
        } else if (!dashInviteSeatTotColumn) {
          this.logger.debug('"dash_seat_invite_tot" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_seat_invite_tot 열을 찾을 수 없습니다.' };
        } else if (!dsshShareDepositColumn) {
          this.logger.debug('"dash_share_deposit" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_share_deposit 열을 찾을 수 없습니다.' };
        } else if (!dashSharePaidColumn) {
          this.logger.debug('"dash_share_paid" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_share_paid 열을 찾을 수 없습니다.' };
        } else if (!dashShareFreeColumn) {
          this.logger.debug('"dash_share_free" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_share_free 열을 찾을 수 없습니다.' };
        } else if (dashPaidSeatColumnIndexList.length === 0) {
          this.logger.debug('"dash_seat_paid" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_seat_paid 열을 찾을 수 없습니다.' };
        } else if (dashInviteSeatColumnIndexList.length === 0) {
          this.logger.debug('"dash_seat_invite" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_seat_invite 열을 찾을 수 없습니다.' };
        } else if (dashCastColumnIndexList.length === 0) {
          this.logger.debug('"dash_cast" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_cast 열을 찾을 수 없습니다.' };
        }

        const dashDateColumnLetter = XLSX.utils.encode_col(dashDateColumn.column);
        const dashTimeColumnLetter = XLSX.utils.encode_col(dashTimeColumn.column);
        const dashDepositTotColumnLetter = XLSX.utils.encode_col(dashPaidTotColumn.column);
        const dashDepositSalesColumnLetter = XLSX.utils.encode_col(dashPaidSalesColumn.column);
        const dashInviteSeatTotColumnLetter = XLSX.utils.encode_col(dashInviteSeatTotColumn.column);
        const dashShareDepositColumnLetter = XLSX.utils.encode_col(dsshShareDepositColumn.column);
        const dashSharePaidColumnLetter = XLSX.utils.encode_col(dashSharePaidColumn.column);
        const dashShareFreeColumnLetter = XLSX.utils.encode_col(dashShareFreeColumn.column);

        this.logger.debug(`"dash_date" 열의 위치: ${dashDateColumnLetter}`);
        this.logger.debug(`"dash_time" 열의 위치: ${dashTimeColumnLetter}`);
        this.logger.debug(`"dash_deposit_tot" 열의 위치: ${dashDepositTotColumnLetter}`);
        this.logger.debug(`"dash_deposit_sales" 열의 위치: ${dashDepositSalesColumnLetter}`);
        this.logger.debug(`"dash_seat_tot" 열의 위치: ${dashInviteSeatTotColumnLetter}`);
        this.logger.debug(`"dash_deposit_seat" 열의 위치: ${JSON.stringify(dashPaidSeatColumnIndexList)}`);
        this.logger.debug(`"dash_invite_seat" 열의 위치: ${JSON.stringify(dashInviteSeatColumnIndexList)}`);
        this.logger.debug(`"dash_cast" 열의 위치: ${JSON.stringify(dashCastColumnIndexList)}`);
        this.logger.debug(`"dash_share_deposit" 열의 위치: ${dashShareDepositColumnLetter}`);
        this.logger.debug(`"dash_share_paid" 열의 위치: ${dashSharePaidColumnLetter}`);
        this.logger.debug(`"dash_share_free" 열의 위치: ${dashShareFreeColumnLetter}`);


        if (dashDateColumn) {


          // 4. "dash_date" 열에서 YYYY.mm.dd 형식의 데이터를 찾습니다.
          const rows = XLSX.utils.sheet_to_json(turnSheet, {
            header: 1,
            range: `${dashDateColumnLetter}1:${dashDateColumnLetter}${turnSheet['!ref'].split(':')[1].replace(/[A-Za-z]/g, '')}`,
            defval: null,
          });

          await Promise.all(rows.map(async (row, index) => {
            const dateValueCell = row[0];
            if (dateValueCell && typeof dateValueCell === 'number') {
              const excelDate = dateValueCell;
              const date = new Date((excelDate - 25569) * 86400 * 1000);

              const dashTimeCell = turnSheet[`${dashTimeColumnLetter}${index + 1}`];

              // 시간 셀 유효성 검사 추가
              if (!dashTimeCell || !dashTimeCell.v || typeof dashTimeCell.v !== 'number' || isNaN(dashTimeCell.v)) {
                this.logger.debug(`유효하지 않은 시간 데이터: '${turnSheetName}' 시트의 row${index + 1}`);
                throw new Error(`유효하지 않은 시간 데이터: '${turnSheetName}' 시트의 row${index + 1}`); // ← throw 사용
              }

              const timeDecimal = dashTimeCell.v;
              const hours = Math.floor(timeDecimal * 24);
              const minutes = Math.round((timeDecimal * 24 - hours) * 60);

              date.setHours(hours);
              date.setMinutes(minutes);
              date.setSeconds(0);

              const paidSeatTotCell = turnSheet[`${dashDepositTotColumnLetter}${index + 1}`];
              const paidSeatSalesCell = turnSheet[`${dashDepositSalesColumnLetter}${index + 1}`];
              const inviteSeatTotCell = turnSheet[`${dashInviteSeatTotColumnLetter}${index + 1}`];
              const shareDepositCell = turnSheet[`${dashShareDepositColumnLetter}${index + 1}`];
              const sharePaidCell = turnSheet[`${dashSharePaidColumnLetter}${index + 1}`];
              const shareFreeCell = turnSheet[`${dashShareFreeColumnLetter}${index + 1}`];


              const [paidSeatTotValue, paidSeatSalesValue, inviteSeatTotVlue, shareDepositValue, sharePaidValue, shareFreeValue] =
                await Promise.all([
                  this.getCellValue(paidSeatTotCell),
                  this.getCellValue(paidSeatSalesCell),
                  this.getCellValue(inviteSeatTotCell),
                  this.getCellValue(shareDepositCell),
                  this.getCellValue(sharePaidCell),
                  this.getCellValue(shareFreeCell)
                ]);


              const shareDeposit = Math.round(Number(shareDepositValue) * 100);
              const sharePaid = Math.round(Number(sharePaidValue) * 100);
              const shareFree = Math.round(Number(shareFreeValue) * 100);

              // Get deposit seat values for seatA, seatR, seatS
              let seatA = null, seatR = null, seatS = null, seatVip = null, badSeatA = null, badSeatR = null, badSeatS = null, disableSeat = null;

              for (const col of dashPaidSeatColumnIndexList) {
                const seatCell = turnSheet[`${XLSX.utils.encode_col(col.column)}${index + 1}`];
                const cellValue = await this.getCellValue(seatCell);
                if (col.seatName === 'a') { seatA = cellValue; }
                if (col.seatName === 'r') seatR = cellValue;
                if (col.seatName === 's') seatS = cellValue;
                if (col.seatName === 'vip') seatVip = cellValue;
                if (col.seatName === 'bada') badSeatA = cellValue;
                if (col.seatName === 'badr') badSeatR = cellValue;
                if (col.seatName === 'bads') badSeatS = cellValue;
                if (col.seatName === 'disable') disableSeat = cellValue;
              }

              let inviteSeatA = null, inviteSeatR = null, inviteSeatS = null, inviteSeatVip = null, inviteBadSeatA = null, inviteBadSeatR = null, inviteBadSeatS = null, inviteDisableSeat = null;
              for (const col of dashInviteSeatColumnIndexList) {
                const seatCell = turnSheet[`${XLSX.utils.encode_col(col.column)}${index + 1}`]; // invite_seat_a1

                const cellValue = await this.getCellValue(seatCell);


                if (col.seatName === 'a') inviteSeatA = cellValue;
                if (col.seatName === 'r') inviteSeatR = cellValue;
                if (col.seatName === 's') inviteSeatS = cellValue;
                if (col.seatName === 'vip') inviteSeatVip = cellValue;
                if (col.seatName === 'bada') inviteBadSeatA = cellValue;
                if (col.seatName === 'badr') inviteBadSeatR = cellValue;
                if (col.seatName === 'bads') inviteBadSeatS = cellValue;
                if (col.seatName === 'disable') inviteDisableSeat = cellValue;
              }

              let cast = [];
              for (const col of dashCastColumnIndexList) {
                const castCell = turnSheet[`${XLSX.utils.encode_col(col.column)}${index + 1}`];
                const cellValue = await this.getCellValue(castCell);
                cast.push(cellValue);
              }

              if (paidSeatTotValue && paidSeatSalesValue && inviteSeatTotVlue && shareDepositValue && sharePaidValue && shareFreeValue) {

                const newTurnSale = this.playTurnSaleRepository.create({
                  playUpload,
                  recordDate: targetDate,
                  liveId: playId,
                  showDateTime: date,
                  cast: cast,
                  paidSeatSales: paidSeatSalesValue,
                  paidSeatTot: paidSeatTotValue,
                  paidSeatVip: seatVip,
                  paidSeatA: seatA,
                  paidSeatR: seatR,
                  paidSeatS: seatS,
                  paidBadSeatA: badSeatA,
                  paidBadSeatR: badSeatR,
                  paidBadSeatS: badSeatS,
                  paidDisableSeat: disableSeat,
                  inviteSeatTot: inviteSeatTotVlue,
                  inviteSeatA: inviteSeatA,
                  inviteSeatR: inviteSeatR,
                  inviteSeatS: inviteSeatS,
                  inviteSeatVip: inviteSeatVip,
                  depositShare: shareDeposit,
                  paidShare: sharePaid,
                  freeShare: shareFree,
                });

                await queryRunner.manager.save(newTurnSale); // 트랜잭션에서 저장
              } else {
                this.logger.debug(`회차별판매 시트의 필요 데이터가 비어 있습니다.(날짜 : ${date})`);
                return { status: false, message: '필요 데이터가 비어 있습니다.' };
              }
            }
          }));
        } else {
          this.logger.debug('"dash_date" 열을 찾을 수 없습니다.');
          return { status: false, message: 'dash_date 열을 찾을 수 없습니다.' };
        }

      } else {
        this.logger.debug('"회차별판매" 시트를 찾을 수 없습니다.');
        return { status: false, message: '회차별판매 시트를 찾을 수 없습니다.' };
      }


      await queryRunner.commitTransaction(); // 트랜잭션 커밋
      return { status: true, message: '업로드 성공' };
    } catch (error) {
      await queryRunner.rollbackTransaction(); // 트랜잭션 롤백
      this.logger.error(error.message, error.stack);
      return { status: false, message: error.message }; // ← 여기서 프론트로 전송
    } finally {
      await queryRunner.release(); // 쿼리 러너 리소스 해제
    }
  }

}
