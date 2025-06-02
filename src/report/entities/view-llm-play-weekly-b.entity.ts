import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_llm_play_weekly_b',
    synchronize: false,
    materialized: false
})
export class ViewLlmPlayWeeklyB {
    @ViewColumn({ name: '공연ID' })
    liveId: string;

    @ViewColumn({ name: '공연명' })
    liveName: string;

    @ViewColumn({ name: '캐스트' })
    cast: string;

    @ViewColumn({ name: '매출액' })
    totalSales: number;

    @ViewColumn({ name: '공연횟수' })
    showCount: number;
}