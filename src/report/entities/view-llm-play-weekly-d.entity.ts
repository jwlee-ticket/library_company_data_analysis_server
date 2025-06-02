import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_llm_play_weekly_d',
    synchronize: false,
    materialized: false
})
export class ViewLlmPlayWeeklyD {
    @ViewColumn({ name: '공연ID' })
    liveId: string;

    @ViewColumn({ name: '공연명' })
    liveName: string;

    @ViewColumn({ name: '주차구별' })
    weekType: string;

    @ViewColumn()
    weekNumber: number;

    @ViewColumn()
    weekStartDate: Date;

    @ViewColumn()
    weekEndDate: Date;

    @ViewColumn()
    salesMarketing: string;

    @ViewColumn()
    promotion: string;

    @ViewColumn()
    etc: string;
}