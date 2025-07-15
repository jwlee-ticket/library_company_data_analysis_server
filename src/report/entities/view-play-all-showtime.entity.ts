import { Entity, Column, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_play_all_showtime',
  synchronize: false,
})
export class ViewPlayAllShowtime {
  @Column({ type: 'varchar', name: 'liveId_' })
  liveId_: string;

  @Column({ type: 'varchar', name: 'liveName' })
  liveName: string;

  @Column({ type: 'date', name: 'latestRecordDate' })
  latestRecordDate: Date;

  @Column({ type: 'bigint', name: 'bep' })
  bep: number;

  @Column({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'date', name: 'recordDate' })
  recordDate: Date;

  @Column({ type: 'varchar', name: 'liveId' })
  liveId: string;

  @Column({ type: 'timestamp', name: 'showDateTime' })
  showDateTime: Date;

  @Column({ type: 'varchar', name: 'cast' })
  cast: string;

  @Column({ type: 'bigint', name: 'paidSeatSales' })
  paidSeatSales: number;

  @Column({ type: 'int', name: 'paidSeatTot' })
  paidSeatTot: number;

  @Column({ type: 'int', name: 'paidSeatVip' })
  paidSeatVip: number;

  @Column({ type: 'int', name: 'paidSeatA' })
  paidSeatA: number;

  @Column({ type: 'int', name: 'paidSeatS' })
  paidSeatS: number;

  @Column({ type: 'int', name: 'paidSeatR' })
  paidSeatR: number;

  @Column({ type: 'int', name: 'paidBadSeatA' })
  paidBadSeatA: number;

  @Column({ type: 'int', name: 'paidBadSeatS' })
  paidBadSeatS: number;

  @Column({ type: 'int', name: 'paidBadSeatR' })
  paidBadSeatR: number;

  @Column({ type: 'int', name: 'paidDisableSeat' })
  paidDisableSeat: number;

  @Column({ type: 'int', name: 'inviteSeatTot' })
  inviteSeatTot: number;

  @Column({ type: 'int', name: 'inviteSeatVip' })
  inviteSeatVip: number;

  @Column({ type: 'int', name: 'inviteSeatA' })
  inviteSeatA: number;

  @Column({ type: 'int', name: 'inviteSeatS' })
  inviteSeatS: number;

  @Column({ type: 'int', name: 'inviteSeatR' })
  inviteSeatR: number;

  @Column({ type: 'int', name: 'inviteBadSeatA' })
  inviteBadSeatA: number;

  @Column({ type: 'int', name: 'inviteBadSeatS' })
  inviteBadSeatS: number;

  @Column({ type: 'int', name: 'inviteBadSeatR' })
  inviteBadSeatR: number;

  @Column({ type: 'int', name: 'inviteDisableSeat' })
  inviteDisableSeat: number;

  @Column({ type: 'numeric', name: 'depositShare' })
  depositShare: number;

  @Column({ type: 'numeric', name: 'paidShare' })
  paidShare: number;

  @Column({ type: 'numeric', name: 'freeShare' })
  freeShare: number;

  @Column({ type: 'int', name: 'playUploadId' })
  playUploadId: number;
} 