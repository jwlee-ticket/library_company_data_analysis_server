import { Entity, Column, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_play_monthly_all',
  synchronize: false,
})
export class ViewPlayMonthlyAll {
  @Column({ type: 'text', name: 'month_str' })
  month_str: string;

  @Column({ type: 'bigint', name: 'total_revenue' })
  total_revenue: number;

  @Column({ type: 'bigint', name: 'absolute_change' })
  absolute_change: number;

  @Column({ type: 'numeric', name: 'percentage_change', nullable: true })
  percentage_change: number;

  @Column({ type: 'text', name: 'note', nullable: true })
  note: string;
} 