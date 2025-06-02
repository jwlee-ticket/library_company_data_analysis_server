import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_llm_play_weekly_a',
    synchronize: false,
    materialized: false
})
export class ViewLlmPlayWeeklyA {
    @ViewColumn({ name: '공연ID' })
    liveId: string;

    @ViewColumn({ name: '공연명' })
    liveName: string;

    @ViewColumn({ name: '지난주_목표점유율' })
    targetShare: number;

    @ViewColumn({ name: '지난주_실제점유율' })
    avgPaidShare: number;

    @ViewColumn({ name: '지난주_목표매출' })
    totalTargetSales: number;

    @ViewColumn({ name: '지난주_실제매출' })
    totalActualSales: number;

    @ViewColumn({ name: '지지난주_실제매출' })
    weekBeforeLastTotalActualSales: number;
}