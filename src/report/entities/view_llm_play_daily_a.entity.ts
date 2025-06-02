import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_llm_play_daily_a',
    synchronize: false,
    materialized: false
})
export class ViewLlmPlayDailyA {
    @ViewColumn({ name: 'liveId' })
    liveId: string;

    @ViewColumn({ name: 'liveName' })
    liveName: string;

    @ViewColumn({ name: 'latestRecordDate' })
    latestRecordDate: Date;

    @ViewColumn({ name: 'latestTicketSales' })
    latestTicketSales: number;

    @ViewColumn({ name: 'latestTicketSalesDate' })
    latestTicketSalesDate: Date;
}