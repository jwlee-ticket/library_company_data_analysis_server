import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_llm_play_est_profit',
    synchronize: false,
    materialized: false
})
export class ViewLlmPlayEstProfit {
    @ViewColumn({ name: 'liveId_' })
    liveId: string;

    @ViewColumn({ name: 'liveName' })
    liveName: string;

    @ViewColumn({ name: 'bep' })
    bep: number;

    @ViewColumn({ name: 'est_total_revenue' })
    estTotalRevenue: number;

    @ViewColumn({ name: 'est_total_profit' })
    estTotalProfit: number;

    @ViewColumn({ name: 'latestRecordDate' })
    latestRecordDate: Date;

    @ViewColumn({ name: 'revenue_before_record_date' })
    revenueBeforeRecordDate: number;

    @ViewColumn({ name: 'shows_before_record_date' })
    showsBeforeRecordDate: number;

    @ViewColumn({ name: 'avg_revenue_per_show_before' })
    avgRevenuePerShowBefore: number;

    @ViewColumn({ name: 'revenue_after_record_date' })
    revenueAfterRecordDate: number;

    @ViewColumn({ name: 'shows_after_record_date' })
    showsAfterRecordDate: number;

    @ViewColumn({ name: 'avg_revenue_per_show_after' })
    avgRevenuePerShowAfter: number;
}