import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_con_est_profit',
    synchronize: false,
    materialized: false,
})
export class ViewConEstProfit {
    @ViewColumn({ name: 'live_name' })
    liveName: string;

    @ViewColumn({ name: 'bep' })
    bep: number;

    @ViewColumn({ name: 'est_sales' })
    estSales: number;

    @ViewColumn({ name: 'final_profit' })
    finalProfit: number;
}