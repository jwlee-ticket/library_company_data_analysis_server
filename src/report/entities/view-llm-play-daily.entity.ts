// view-llm-play-daily.entity.ts
import { ViewEntity, ViewColumn, PrimaryColumn } from 'typeorm';

@ViewEntity({
    name: 'view_llm_play_daily',
    synchronize: false
})
export class ViewLlmPlayDaily {
    @PrimaryColumn()
    id: number;

    @ViewColumn({ name: 'liveId_' })
    liveId: string;

    @ViewColumn()
    liveName: string;

    @ViewColumn()
    latestRecordDate: Date;

    @ViewColumn()
    showTotalSeatNumber: number;

    @ViewColumn({ name: '티켓판매일매출' })
    dailySales: number;

    @ViewColumn()
    start_date: Date;

    @ViewColumn()
    end_date: Date;

    @ViewColumn()
    recordDate: Date;

    @ViewColumn()
    showDateTime: Date;

    @ViewColumn()
    cast: string;

    @ViewColumn()
    paidSeatSales: number;

    @ViewColumn()
    paidSeatTot: number;

    // inviteSeatSales 제거 (실제 뷰에 존재하지 않음)

    @ViewColumn()
    paidSeatVip: number;

    @ViewColumn()
    paidSeatA: number;

    @ViewColumn()
    paidSeatS: number;

    @ViewColumn()
    paidSeatR: number;

    // 실제 뷰에 있는 컬럼들만 포함
    @ViewColumn()
    inviteSeatTot: number;

    // 기타 필요한 컬럼들...
    @ViewColumn()
    paidBadSeatA: number;

    @ViewColumn()
    paidBadSeatS: number;

    @ViewColumn()
    paidBadSeatR: number;

    @ViewColumn()
    paidDisableSeat: number;

    @ViewColumn()
    inviteSeatVip: number;

    @ViewColumn()
    inviteSeatA: number;

    @ViewColumn()
    inviteSeatS: number;

    @ViewColumn()
    inviteSeatR: number;

    @ViewColumn()
    inviteBadSeatA: number;

    @ViewColumn()
    inviteBadSeatS: number;

    @ViewColumn()
    inviteBadSeatR: number;

    @ViewColumn()
    inviteDisableSeat: number;

    @ViewColumn()
    depositShare: number;

    @ViewColumn()
    paidShare: number;

    @ViewColumn()
    freeShare: number;

    @ViewColumn()
    playUploadId: number;
}