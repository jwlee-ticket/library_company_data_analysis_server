import { ViewEntity, ViewColumn } from 'typeorm';

/**
 * 콘서트 전체 개요 View
 * 어제 매출, 누적 매출, 주간 매출, 일평균 매출 등 주요 지표를 한눈에 조회
 */
@ViewEntity({
    name: 'view_con_all_overview',
    synchronize: false,
    materialized: false,
})
export class ViewConAllOverview {
    /** 어제 매출 (전일 기준 매출 금액) */
    @ViewColumn({ name: 'yesterday_sales' })
    yesterdaySales: number;

    /** 누적 매출 (전체 기간 총 매출 금액) */
    @ViewColumn({ name: 'accumulated_sales' })
    accumulatedSales: number;

    /** 주간 매출 (이번 주 매출 금액) */
    @ViewColumn({ name: 'weekly_sales' })
    weeklySales: number;

    /** 일평균 매출 (누적 매출 / 영업일수) */
    @ViewColumn({ name: 'daily_avg_sales' })
    dailyAvgSales: number;
}