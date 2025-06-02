import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
    name: 'view_llm_play_weekly_c',
    synchronize: false,
    materialized: false
})
export class ViewLlmPlayWeeklyC {
    @ViewColumn({ name: 'liveId_' })
    liveId: string;

    @ViewColumn()
    liveName: string;

    @ViewColumn()
    location: string;

    @ViewColumn()
    latestRecordDate: Date;

    @ViewColumn()
    start_date: Date;

    @ViewColumn()
    end_date: Date;

    @ViewColumn({ name: 'showId' })
    showId: number;

    @ViewColumn()
    recordDate: Date;

    @ViewColumn()
    showDateTime: Date;

    @ViewColumn()
    formattedShowTime: string;

    @ViewColumn()
    cast: string;

    @ViewColumn()
    paidSeatSales: number;

    @ViewColumn()
    paidSeatTot: number;

    @ViewColumn()
    inviteSeatTot: number;

    @ViewColumn()
    totalAttendance: number;

    @ViewColumn()
    paidSeatVip: number;

    @ViewColumn()
    paidSeatA: number;

    @ViewColumn()
    paidSeatS: number;

    @ViewColumn()
    paidSeatR: number;

    @ViewColumn()
    inviteSeatVip: number;

    @ViewColumn()
    inviteSeatA: number;

    @ViewColumn()
    inviteSeatS: number;

    @ViewColumn()
    inviteSeatR: number;

    @ViewColumn()
    depositShare: number;

    @ViewColumn()
    paidShare: number;

    @ViewColumn()
    freeShare: number;

    @ViewColumn({ name: 'fileUploadId' })
    fileUploadId: number;

    @ViewColumn()
    fileName: string;
}