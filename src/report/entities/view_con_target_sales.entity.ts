import { ViewEntity, ViewColumn } from 'typeorm';

/**
 * 콘서트 목표 매출 달성률 View
 * 목표 매출 대비 현재 달성률을 추적
 */
@ViewEntity({
    name: 'view_con_target_sales',
    synchronize: false,
    materialized: false,
})
export class ViewConTargetSales {
    /** 콘서트명 */
    @ViewColumn({ name: 'live_name' })
    liveName: string;

    /** 목표 매출 (설정된 매출 목표 금액) */
    @ViewColumn({ name: 'target_sales' })
    targetSales: number;

    /** 누적 매출 (현재까지 달성한 매출 금액) */
    @ViewColumn({ name: 'sales_acc' })
    salesAcc: number;

    /** 목표 달성률 (누적 매출 / 목표 매출, 0.0~1.0) */
    @ViewColumn({ name: 'target_ratio' })
    targetRatio: number;
}