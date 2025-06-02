import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_con_all_overview',
    synchronize: false,
    materialized: false,
})
export class ViewConAllOverview {
    @ViewColumn({ name: 'yesterday_sales' })
    yesterdaySales: number;

    @ViewColumn({ name: 'accumulated_sales' })
    accumulatedSales: number;

    @ViewColumn({ name: 'weekly_sales' })
    weeklySales: number;

    @ViewColumn({ name: 'daily_avg_sales' })
    dailyAvgSales: number;
}