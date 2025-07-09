import { ViewEntity, ViewColumn } from 'typeorm';

/**
 * 콘서트 BEP(손익분기점) 분석 View
 * 좌석 클래스별 판매 현황, 예상 판매량, BEP 달성률 등을 상세 분석
 */
@ViewEntity({
    name: 'view_con_bep',
    synchronize: false,
    materialized: false,
})
export class ViewConBep {
    /** 콘서트 라이브 ID */
    @ViewColumn({ name: 'live_id' })
    liveId: string;

    /** 콘서트명 */
    @ViewColumn({ name: 'live_name' })
    liveName: string;

    /** 최근 기록 날짜 (가장 최신 데이터 기준일) */
    @ViewColumn({ name: 'latestRecordDate' })
    latestRecordDate: Date;

    /** 판매 시작일 */
    @ViewColumn({ name: 'sales_start_date' })
    salesStartDate: Date;

    /** 판매 종료일 */
    @ViewColumn({ name: 'sales_end_date' })
    salesEndDate: Date;

    /** 좌석 등급 (A석, R석, S석, B석 등) */
    @ViewColumn({ name: 'seat_class' })
    seatClass: string;

    /** 좌석 등급 순서 (정렬용) */
    @ViewColumn({ name: 'seatorder' })
    seatOrder: number;

    /** 총 좌석 수 (해당 등급의 전체 좌석) */
    @ViewColumn({ name: 'total_seats' })
    totalSeats: number;

    /** 판매된 좌석 수 (현재까지 판매 완료) */
    @ViewColumn({ name: 'sold_seats' })
    soldSeats: number;

    /** 남은 좌석 수 (총 좌석 - 판매 좌석) */
    @ViewColumn({ name: 'remaining_seats' })
    remainingSeats: number;

    /** 예상 추가 판매 좌석 수 (트렌드 기반 예상) */
    @ViewColumn({ name: 'est_additional_sales' })
    estAdditionalSales: number;

    /** 최종 예상 남은 좌석 수 (남은 좌석 - 예상 추가 판매) */
    @ViewColumn({ name: 'est_final_remaining' })
    estFinalRemaining: number;

    /** BEP 달성 필요 좌석 수 (손익분기점 달성에 필요한 최소 판매 좌석) */
    @ViewColumn({ name: 'bep_seats' })
    bepSeats: number;

    /** 예상 판매율 (현재 판매 + 예상 추가 판매 / 총 좌석) */
    @ViewColumn({ name: 'est_sales_ratio' })
    estSalesRatio: number;

    // @ViewColumn({ name: 'est_remaining_ratio' })
    // estRemainingRatio: number;

    /** BEP 달성률 (현재 판매 좌석 / BEP 필요 좌석, 1.0 이상이면 BEP 달성) */
    @ViewColumn({ name: 'bep_ratio' })
    bepRatio: number;
}