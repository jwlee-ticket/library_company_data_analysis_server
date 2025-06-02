import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_con_bep',
    synchronize: false,
    materialized: false,
})
export class ViewConBep {
    @ViewColumn({ name: 'live_id' })
    liveId: string;

    @ViewColumn({ name: 'live_name' })
    liveName: string;

    @ViewColumn({ name: 'latestRecordDate' })
    latestRecordDate: Date;

    @ViewColumn({ name: 'sales_start_date' })
    salesStartDate: Date;

    @ViewColumn({ name: 'sales_end_date' })
    salesEndDate: Date;

    @ViewColumn({ name: 'seat_class' })
    seatClass: string;

    @ViewColumn({ name: 'seatorder' })
    seatOrder: number;

    @ViewColumn({ name: 'total_seats' })
    totalSeats: number;

    @ViewColumn({ name: 'sold_seats' })
    soldSeats: number;

    @ViewColumn({ name: 'remaining_seats' })
    remainingSeats: number;

    @ViewColumn({ name: 'est_additional_sales' })
    estAdditionalSales: number;

    @ViewColumn({ name: 'est_final_remaining' })
    estFinalRemaining: number;

    @ViewColumn({ name: 'bep_seats' })
    bepSeats: number;

    @ViewColumn({ name: 'est_sales_ratio' })
    estSalesRatio: number;

    // @ViewColumn({ name: 'est_remaining_ratio' })
    // estRemainingRatio: number;

    @ViewColumn({ name: 'bep_ratio' })
    bepRatio: number;
}