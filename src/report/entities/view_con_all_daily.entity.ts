import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_con_all_daily',
    synchronize: false,
    materialized: false,
})
export class ViewConAllDaily {
    @ViewColumn({ name: 'live_id' })
    liveId: string;

    @ViewColumn({ name: 'live_name' })
    liveName: string;

    @ViewColumn({ name: 'record_date' })
    recordDate: Date;

    @ViewColumn({ name: 'record_month' })
    recordMonth: string;

    @ViewColumn({ name: 'record_week' })
    recordWeek: Date;

    @ViewColumn({ name: 'daily_sales_ticket_no' })
    dailySalesTicketNo: number;

    @ViewColumn({ name: 'daily_sales_amount' })
    dailySalesAmount: number;
}