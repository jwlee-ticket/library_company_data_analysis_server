import { Entity, Column, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_play_revenue_by_cast',
  synchronize: false,
})
export class ViewPlayRevenueByCast {
  @Column({ type: 'varchar', name: 'liveId' })
  liveId: string;

  @Column({ type: 'varchar', name: 'liveName' })
  liveName: string;

  @Column({ type: 'varchar', name: 'cast' })
  cast: string;

  @Column({ type: 'bigint', name: 'totalpaidseatsales' })
  totalpaidseatsales: number;

  @Column({ type: 'bigint', name: 'showcount' })
  showcount: number;
} 