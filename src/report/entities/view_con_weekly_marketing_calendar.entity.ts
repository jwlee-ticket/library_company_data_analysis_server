import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_con_weekly_marketing_calendar',
    synchronize: false,
    materialized: false,
})
export class ViewConWeeklyMarketingCalendar {
    @ViewColumn({ name: 'live_name' })
    liveName: string;

    @ViewColumn({ name: 'week_start_date' })
    weekStartDate: Date;

    @ViewColumn({ name: 'week_end_date' })
    weekEndDate: Date;

    @ViewColumn({ name: 'sales_marketing' })
    salesMarketing: string;

    @ViewColumn({ name: 'promotion' })
    promotion: string;

    @ViewColumn({ name: 'etc' })
    etc: string;
}