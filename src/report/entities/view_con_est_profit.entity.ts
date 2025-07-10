import { ViewEntity, ViewColumn } from 'typeorm';

/**
 * 콘서트 예상 수익 View
 * 손익분기점, 예상 매출, 최종 예상 수익을 분석
 */
@ViewEntity({
    name: 'view_con_est_profit',
    synchronize: false,
    materialized: false,
})
export class ViewConEstProfit {
    /** 콘서트명 */
    @ViewColumn({ name: 'live_name' })
    liveName: string;

    /** BEP (손익분기점) - 수익이 0이 되는 매출 금액 */
    @ViewColumn({ name: 'bep' })
    bep: number;

    /** 예상 매출 (현재 트렌드 기반 최종 예상 매출) */
    @ViewColumn({ name: 'est_sales' })
    estSales: number;

    /** 최종 예상 수익 (예상 매출 - BEP) */
    @ViewColumn({ name: 'final_profit' })
    finalProfit: number;
}