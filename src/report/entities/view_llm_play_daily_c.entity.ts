import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_llm_play_daily_c',
    synchronize: false,
    materialized: false
})
export class ViewLlmPlayDailyC {
    @ViewColumn({ name: 'liveId' })
    liveId: string;

    @ViewColumn({ name: 'liveName' })
    liveName: string;

    @ViewColumn({ name: 'show_date' })
    showDate: Date;

    @ViewColumn({ name: 'share' })
    share: number;

    @ViewColumn({ name: 'showTotalSeatNumber' })
    showTotalSeatNumber: number;

    @ViewColumn({ name: 'paidSeatTot' })
    paidSeatTot: number;

    @ViewColumn({ name: 'inviteSeatTot' })
    inviteSeatTot: number;

    @ViewColumn({ name: 'remaining_seats' })
    remainingSeats: number;
}