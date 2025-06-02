import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_llm_play_weekly_paidshare',
    synchronize: false,
    materialized: false
})
export class ViewLlmPlayWeeklyPaidshare {
    @ViewColumn({ name: '공연 ID' })
    liveId: string;

    @ViewColumn({ name: '공연명' })
    liveName: string;

    @ViewColumn({ name: '주 시작일' })
    weekStartDate: string;

    @ViewColumn({ name: '주 종료일' })
    weekEndDate: string;

    @ViewColumn({ name: '유료 객석 점유율(%)' })
    paidSharePercentage: number;

    @ViewColumn({ name: '해당 주 공연 횟수' })
    weeklyShowCount: number;
}