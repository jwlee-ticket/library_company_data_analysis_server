import { ViewEntity, ViewColumn } from 'typeorm';

/**
 * 콘서트 주간 매출 데이터 View
 * 주간별 매출 금액, 판매 매수, 마케팅 활동 정보를 제공
 */
@ViewEntity({
    name: 'view_con_all_weekly',
    synchronize: false,
    materialized: false,
})
export class ViewConAllWeekly {
    /** 콘서트 라이브 ID */
    @ViewColumn({ name: 'live_id' })
    liveId: string;

    /** 콘서트명 */
    @ViewColumn({ name: 'live_name' })
    liveName: string;

    /** 기록 주 시작일 (해당 주의 시작일) */
    @ViewColumn({ name: 'record_week' })
    recordWeek: Date;

    /** 주간 판매 티켓 수량 */
    @ViewColumn({ name: 'weekly_sales_ticket_no' })
    weeklySalesTicketNo: number;

    /** 주간 매출 금액 (원) */
    @ViewColumn({ name: 'weekly_sales_amount' })
    weeklySalesAmount: number;

    /** 영업/마케팅 활동 내용 */
    @ViewColumn({ name: 'note_sales_marketing' })
    noteSalesMarketing: string;

    /** 프로모션 활동 내용 */
    @ViewColumn({ name: 'note_promotion' })
    notePromotion: string;

    /** 기타 특이사항 */
    @ViewColumn({ name: 'note_etc' })
    noteEtc: string;
} 