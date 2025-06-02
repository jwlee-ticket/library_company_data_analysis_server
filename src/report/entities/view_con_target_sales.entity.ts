import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_con_target_sales',
    synchronize: false,
    materialized: false,
})
export class ViewConTargetSales {
    @ViewColumn({ name: 'live_name' })
    liveName: string;

    @ViewColumn({ name: 'target_sales' })
    targetSales: number;

    @ViewColumn({ name: 'sales_acc' })
    salesAcc: number;

    @ViewColumn({ name: 'target_ratio' })
    targetRatio: number;
}