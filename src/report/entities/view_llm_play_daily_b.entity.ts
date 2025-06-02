import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_llm_play_daily_b',
    synchronize: false,
    materialized: false
})
export class ViewLlmPlayDailyB {
    @ViewColumn({ name: 'live_id' })
    liveId: number;

    @ViewColumn({ name: 'live_reference_id' })
    liveReferenceId: string;

    @ViewColumn({ name: 'live_name' })
    liveName: string;

    @ViewColumn({ name: 'latest_share' })
    latestShare: number;

    @ViewColumn({ name: 'latest_date' })
    latestDate: Date;

    @ViewColumn({ name: 'prev_share' })
    prevShare: number;

    @ViewColumn({ name: 'prev_date' })
    prevDate: Date;

    @ViewColumn({ name: 'change_share' })
    changeShare: number;
}