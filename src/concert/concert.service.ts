import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConcertTicketSaleModel } from './entities/concert-ticket-sale.entity';
import { ConcertSeatSaleModel } from './entities/concert-seat-sale.entity';
import * as XLSX from 'xlsx';
import { FileUploadModel } from 'src/upload/entities/file-upload.entity';
import { ViewConAllDaily } from '../report/entities/view_con_all_daily.entity';
import { ViewConAllOverview } from '../report/entities/view_con_all_overview.entity';
import { ViewConBep } from '../report/entities/view_con_bep.entity';
import { ViewConEstProfit } from '../report/entities/view_con_est_profit.entity';
import { ViewConTargetSales } from '../report/entities/view_con_target_sales.entity';
import { ViewConWeeklyMarketingCalendar } from '../report/entities/view_con_weekly_marketing_calendar.entity';
import { ViewConAllWeekly } from '../report/entities/view_con_all_weekly.entity';
@Injectable()
export class ConcertService {
    private readonly logger = new Logger(ConcertService.name);

    constructor(
        @InjectRepository(ConcertTicketSaleModel)
        private readonly concertTicketSaleRepository: Repository<ConcertTicketSaleModel>,
        @InjectRepository(ConcertSeatSaleModel)
        private readonly concertSeatSaleRepository: Repository<ConcertSeatSaleModel>,
        @InjectRepository(ViewConAllDaily)
        private viewConAllDailyRepository: Repository<ViewConAllDaily>,
        @InjectRepository(ViewConAllOverview)
        private viewConAllOverviewRepository: Repository<ViewConAllOverview>,
        @InjectRepository(ViewConBep)
        private viewConBepRepository: Repository<ViewConBep>,
        @InjectRepository(ViewConEstProfit)
        private viewConEstProfitRepository: Repository<ViewConEstProfit>,
        @InjectRepository(ViewConTargetSales)
        private viewConTargetSalesRepository: Repository<ViewConTargetSales>,
        @InjectRepository(ViewConWeeklyMarketingCalendar)
        private viewConWeeklyMarketingCalendarRepository: Repository<ViewConWeeklyMarketingCalendar>,
        @InjectRepository(ViewConAllWeekly)
        private viewConAllWeeklyRepository: Repository<ViewConAllWeekly>,
    ) { }


    isErrorCell(cell) {

        if (!cell || !cell.t) {
            return false;
        }

        return cell.t.toString() === 'e' || cell.w === '#REF!';
    }

    async getCellValue(cell) {
        if (!cell) {
            return 0;
        }

        if (this.isErrorCell(cell)) {
            return null;
        }

        return cell ? cell.v : 0;
    }

    async uploadExcelData(file, concertUpload: FileUploadModel) {
        const queryRunner = this.concertTicketSaleRepository.manager.connection.createQueryRunner();

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
            const dailySheetName = '일일 판매';
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

                // let dashDepositSeatColumnIndexList = [];

                // await dashColumns.find((col) => {
                //     if (col.value.includes('dash_seat_deposit')) {
                //         const seatName = col.value.split('_')[3];
                //         const result = { seatName: seatName, column: col.column }; // seatName과 column을 매핑
                //         dashDepositSeatColumnIndexList.push(result);
                //     }
                // });



                const dashDateColumn = dashColumns.find(col => col.value === 'dash_date');
                const dashSeatPaidTotColumn = dashColumns.find(col => col.value === 'dash_seat_paid_tot');
                const dashSeatPaidSalesColumn = dashColumns.find(col => col.value === 'dash_seat_paid_sales');
                const dashSeatInviteTotColumn = dashColumns.find(col => col.value === 'dash_seat_invite_tot');

                this.logger.debug(`dashDateColumn: ${dashDateColumn}`);
                this.logger.debug(`dashSeatPaidTotColumn: ${dashSeatPaidTotColumn}`);
                this.logger.debug(`dashSeatPaidSalesColumn: ${dashSeatPaidSalesColumn}`);
                this.logger.debug(`dashSeatInviteTotColumn: ${dashSeatInviteTotColumn}`);

                if (!dashDateColumn) {
                    this.logger.debug('"dash_date" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_date 열을 찾을 수 없습니다.' };
                } else if (!dashSeatPaidTotColumn) {
                    this.logger.debug('"dash_seat_paid_tot" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_seat_paid_tot 열을 찾을 수 없습니다.' };
                } else if (!dashSeatPaidSalesColumn) {
                    this.logger.debug('"dash_seat_paid_sales" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_seat_paid_sales 열을 찾을 수 없습니다.' };
                } else if (!dashSeatInviteTotColumn) {
                    this.logger.debug('"dash_seat_invite_tot" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_seat_invite_tot 열을 찾을 수 없습니다.!!!' };
                }

                const dashDateColumnLetter = XLSX.utils.encode_col(dashDateColumn.column);
                const dashSeatPaidTotColumnLetter = XLSX.utils.encode_col(dashSeatPaidTotColumn.column);
                const dashSeatPaidSalesColumnLetter = XLSX.utils.encode_col(dashSeatPaidSalesColumn.column);
                const dashSeatInviteTotColumnLetter = XLSX.utils.encode_col(dashSeatInviteTotColumn.column);

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




                            excelDateList.push(date);

                            const paidSeatTotCell = dailySheet[`${dashSeatPaidTotColumnLetter}${index + 1}`];
                            const paidSeatSalesCell = dailySheet[`${dashSeatPaidSalesColumnLetter}${index + 1}`];
                            const inviteSeatTotCell = dailySheet[`${dashSeatInviteTotColumnLetter}${index + 1}`];

                            const [paidSeatTotValue, paidSeatSalesValue, inviteSeatTotValue] = await Promise.all([
                                this.getCellValue(paidSeatTotCell),
                                this.getCellValue(paidSeatSalesCell),
                                this.getCellValue(inviteSeatTotCell),
                            ]);

                            this.logger.debug(`paidSeatTotValue: ${paidSeatTotValue}`);
                            this.logger.debug(`paidSeatSalesValue: ${paidSeatSalesValue}`);
                            this.logger.debug(`inviteSeatTotValue: ${inviteSeatTotValue}`);


                            if (paidSeatTotValue !== null && paidSeatSalesValue !== null && inviteSeatTotValue !== null) {
                                // this.logger.debug(`날짜: ${date}, depositTotCell: ${depositTotCell.v}, depositSalesCell: ${depositSalesCell.v}, seatA: ${seatA}, seatR: ${seatR}, seatS: ${seatS}, marketingCell: ${marketingCell?.v ?? null}`);

                                const newDalySale = this.concertTicketSaleRepository.create({
                                    concertUpload: concertUpload,
                                    recordDate: targetDate,
                                    liveId: playId,
                                    salesDate: date,
                                    sales: paidSeatSalesValue,
                                    paidSeatTot: paidSeatTotValue,
                                    inviteSeatTot: inviteSeatTotValue,
                                });

                                await queryRunner.manager.save(newDalySale); // 트랜잭션에서 저장
                            } else {
                                this.logger.debug(`일일 판매 시트의 필요 데이터가 비어 있습니다.(paidSeatTotValue : ${paidSeatTotValue} , paidSeatSalesValue : ${paidSeatSalesValue} , inviteSeatTotValue : ${inviteSeatTotValue} )`);
                                return { status: false, message: '필요 데이터가 비어 있습니다.' };
                            }
                        }
                    }));

                    this.logger.debug(`excelDateList: ${excelDateList}`);

                } else {
                    this.logger.debug('"dash_date" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_date 열을 찾을 수 없습니다.' };
                }
            } else {
                this.logger.debug('"일일 판매" 시트를 찾을 수 없습니다.');
                return { status: false, message: '일일 판매 시트를 찾을 수 없습니다.' };
            }

            // "회차별판매" 시트를 찾습니다.
            const turnSheetName = 'Seat details';
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
                    this.logger.debug('"Seat detatils" 시트의 2행 중 "dash_"으로 시작하는 셀을 찾을 수 없습니다.');
                    return { status: false, message: 'Seat detatils 시트의 2행 중 "dash_"으로 시작하는 셀을 찾을 수 없습니다.' };
                }

                this.logger.debug(`"Seat detatils" 시트의 2행 중 "dash_"으로 시작하는 셀의 위치 및 값을 로그로 출력: ${JSON.stringify(dashColumns)}`);

                let dashPaidSeatColumnIndexList = [];
                let dashInviteSeatColumnIndexList = [];


                await dashColumns.find((col) => {
                    if (col.value.includes('dash_seat_paid')) {
                        const seatName = col.value.split('_')[3];
                        const result = { seatName: seatName, column: col.column }; // seatName과 column을 매핑
                        dashPaidSeatColumnIndexList.push(result);
                    } else if (col.value.includes('dash_seat_invite')) {
                        const seatName = col.value.split('_')[3];
                        const result = { seatName: seatName, column: col.column }; // seatName과 column을 매핑
                        dashInviteSeatColumnIndexList.push(result);
                    }
                });

                const dashDateColumn = dashColumns.find(col => col.value === 'dash_date');
                const dashTimeColumn = dashColumns.find(col => col.value === 'dash_time');
                const dashPaidTotColumn = dashColumns.find(col => col.value === 'dash_seat_paid_tot');
                const dashInviteSeatTotColumn = dashColumns.find(col => col.value === 'dash_seat_invite_tot');

                if (!dashDateColumn) {
                    this.logger.debug('"dash_date" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_date 열을 찾을 수 없습니다.' };
                } else if (!dashTimeColumn) {
                    this.logger.debug('"dash_time" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_time 열을 찾을 수 없습니다.' };
                } else if (!dashPaidTotColumn) {
                    this.logger.debug('"dash_seat_paid_tot" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_seat_paid_tot 열을 찾을 수 없습니다.' };
                } else if (!dashInviteSeatTotColumn) {
                    this.logger.debug('"dash_seat_invite_tot" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_seat_invite_tot 열을 찾을 수 없습니다.' };
                } else if (dashPaidSeatColumnIndexList.length === 0) {
                    this.logger.debug('"dash_seat_paid" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_seat_paid 열을 찾을 수 없습니다.' };
                } else if (dashInviteSeatColumnIndexList.length === 0) {
                    this.logger.debug('"dash_seat_invite" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_seat_invite 열을 찾을 수 없습니다.' };
                }

                const dashDateColumnLetter = XLSX.utils.encode_col(dashDateColumn.column);
                const dashTimeColumnLetter = XLSX.utils.encode_col(dashTimeColumn.column);
                const dashDepositTotColumnLetter = XLSX.utils.encode_col(dashPaidTotColumn.column);
                const dashInviteSeatTotColumnLetter = XLSX.utils.encode_col(dashInviteSeatTotColumn.column);


                this.logger.debug(`"dash_date" 열의 위치: ${dashDateColumnLetter}`);
                this.logger.debug(`"dash_time" 열의 위치: ${dashTimeColumnLetter}`);
                this.logger.debug(`"dash_deposit_tot" 열의 위치: ${dashDepositTotColumnLetter}`);
                this.logger.debug(`"dash_seat_tot" 열의 위치: ${dashInviteSeatTotColumnLetter}`);
                this.logger.debug(`"dash_deposit_seat" 열의 위치: ${JSON.stringify(dashPaidSeatColumnIndexList)}`);
                this.logger.debug(`"dash_invite_seat" 열의 위치: ${JSON.stringify(dashInviteSeatColumnIndexList)}`);



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
                            const timeDecimal = dashTimeCell.v;
                            const hours = Math.floor(timeDecimal * 24);
                            const minutes = Math.round((timeDecimal * 24 - hours) * 60);

                            date.setHours(hours);
                            date.setMinutes(minutes);
                            date.setSeconds(0);

                            const paidSeatTotCell = turnSheet[`${dashDepositTotColumnLetter}${index + 1}`];
                            const inviteSeatTotCell = turnSheet[`${dashInviteSeatTotColumnLetter}${index + 1}`];


                            const [paidSeatTotValue, inviteSeatTotValue] =
                                await Promise.all([
                                    this.getCellValue(paidSeatTotCell),
                                    this.getCellValue(inviteSeatTotCell),
                                ]);



                            // Get deposit seat values for seatA, seatR, seatS
                            let seatA = null, seatR = null, seatS = null, seatB = null

                            for (const col of dashPaidSeatColumnIndexList) {
                                const seatCell = turnSheet[`${XLSX.utils.encode_col(col.column)}${index + 1}`];
                                const cellValue = await this.getCellValue(seatCell);
                                if (col.seatName === 'a') { seatA = cellValue; }
                                if (col.seatName === 'r') seatR = cellValue;
                                if (col.seatName === 's') seatS = cellValue;
                                if (col.seatName === 'b') seatB = cellValue;
                            }

                            let inviteSeatA = null, inviteSeatR = null, inviteSeatS = null, inviteSeatB = null;
                            for (const col of dashInviteSeatColumnIndexList) {
                                const seatCell = turnSheet[`${XLSX.utils.encode_col(col.column)}${index + 1}`]; // invite_seat_a1

                                const cellValue = await this.getCellValue(seatCell);


                                if (col.seatName === 'a') inviteSeatA = cellValue;
                                if (col.seatName === 'r') inviteSeatR = cellValue;
                                if (col.seatName === 's') inviteSeatS = cellValue;
                                if (col.seatName === 'b') inviteSeatB = cellValue;
                            }



                            if (paidSeatTotValue && inviteSeatTotValue) {

                                const newTurnSale = this.concertSeatSaleRepository.create({
                                    concertUpload: concertUpload,
                                    recordDate: targetDate,
                                    liveId: playId,
                                    showDateTime: date,
                                    paidSeatTot: paidSeatTotValue,
                                    inviteSeatTot: inviteSeatTotValue,
                                    paidSeatA: seatA,
                                    paidSeatR: seatR,
                                    paidSeatS: seatS,
                                    paidSeatB: seatB,
                                    inviteSeatA: inviteSeatA,
                                    inviteSeatR: inviteSeatR,
                                    inviteSeatS: inviteSeatS,
                                    inviteSeatB: inviteSeatB,
                                });

                                await queryRunner.manager.save(newTurnSale); // 트랜잭션에서 저장
                            } else {
                                this.logger.debug(`Seat detatils 시트의 필요 데이터가 비어 있습니다.(날짜 : ${date})`);
                                return { status: false, message: '필요 데이터가 비어 있습니다.' };
                            }
                        }
                    }));
                } else {
                    this.logger.debug('"dash_date" 열을 찾을 수 없습니다.');
                    return { status: false, message: 'dash_date 열을 찾을 수 없습니다.' };
                }

            } else {
                this.logger.debug('"Seat detatils" 시트를 찾을 수 없습니다.');
                return { status: false, message: 'Seat detatils 시트를 찾을 수 없습니다.' };
            }


            await queryRunner.commitTransaction(); // 트랜잭션 커밋
            return { status: true, message: '업로드 성공' };
        } catch (error) {
            await queryRunner.rollbackTransaction(); // 트랜잭션 롤백
            this.logger.error(error.message, error.stack);
            return { status: false, message: '업로드 실패' };
        } finally {
            await queryRunner.release(); // 쿼리 러너 리소스 해제
        }
    }

    // 콘서트 일일 매출 데이터
    async getConAllDaily(): Promise<ViewConAllDaily[]> {
        return this.viewConAllDailyRepository.find({
            order: { liveId: 'ASC', recordDate: 'DESC' }
        });
    }

    // 콘서트 전체 개요 (어제/누적/주간 매출)
    async getConAllOverview(): Promise<ViewConAllOverview[]> {
        return this.viewConAllOverviewRepository.find();
    }

    // 콘서트 예상 수익
    async getConEstProfit(): Promise<ViewConEstProfit[]> {
        return this.viewConEstProfitRepository.find({
            order: { liveName: 'ASC' }
        });
    }

    // 콘서트 목표 매출
    async getConTargetSales(): Promise<ViewConTargetSales[]> {
        return this.viewConTargetSalesRepository.find({
            order: { liveName: 'ASC' }
        });
    }

    // 콘서트 BEP (손익분기점) 분석
    async getConBep(): Promise<ViewConBep[]> {
        return this.viewConBepRepository.find({
            order: { liveName: 'ASC', seatOrder: 'ASC' }
        });
    }

    // 콘서트 주간 마케팅 캘린더
    async getConWeeklyMarketingCalendar(): Promise<ViewConWeeklyMarketingCalendar[]> {
        return this.viewConWeeklyMarketingCalendarRepository.find({
            order: { liveName: 'ASC', weekStartDate: 'DESC' }
        });
    }

    // 콘서트 월간 매출 데이터 (그래프용)
    async getConMonthly() {
        const query = `
            SELECT 
                live_id as "liveId",
                live_name as "liveName",
                record_month as "recordMonth",
                SUM(daily_sales_amount) as "monthlySalesAmount"
            FROM view_con_all_daily
            GROUP BY live_id, live_name, record_month
            ORDER BY live_id, record_month DESC
        `;
        
        return this.viewConAllDailyRepository.query(query);
    }

    // 콘서트 주간 매출 데이터
    async getConAllWeekly(): Promise<ViewConAllWeekly[]> {
        return this.viewConAllWeeklyRepository.find({
            order: { liveId: 'ASC', recordWeek: 'DESC' }
        });
    }
}
