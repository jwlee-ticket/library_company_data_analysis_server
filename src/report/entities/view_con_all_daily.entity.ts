import { ViewEntity, ViewColumn } from 'typeorm';

/**
 * 콘서트 일일 매출 데이터 View
 * 일별 티켓 판매 수량과 매출 금액을 조회
 */
@ViewEntity({
    name: 'view_con_all_daily',
    synchronize: false,
    materialized: false,
})
export class ViewConAllDaily {
    /** 콘서트 라이브 ID */
    @ViewColumn({ name: 'live_id' })
    liveId: string;

    /** 콘서트명 */
    @ViewColumn({ name: 'live_name' })
    liveName: string;

    /** 기록 날짜 (일일 매출 집계 기준일) */
    @ViewColumn({ name: 'record_date' })
    recordDate: Date;

    /** 기록 월 (YYYY-MM 형식) */
    @ViewColumn({ name: 'record_month' })
    recordMonth: string;

    /** 기록 주 시작일 (해당 날짜가 속한 주의 시작일) */
    @ViewColumn({ name: 'record_week' })
    recordWeek: Date;

    /** 일일 판매 티켓 수량 */
    @ViewColumn({ name: 'daily_sales_ticket_no' })
    dailySalesTicketNo: number;

    /** 일일 매출 금액 (원) */
    @ViewColumn({ name: 'daily_sales_amount' })
    dailySalesAmount: number;
}