import { Entity, Column, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_play_monthly_respective',
  synchronize: false,
})
export class ViewPlayMonthlyRespective {
  @Column({ type: 'text', name: 'month' })
  month: string;

  @Column({ type: 'varchar', name: 'performance_name' })
  performance_name: string;

  @Column({ type: 'bigint', name: 'total_revenue' })
  total_revenue: number;

  @Column({ type: 'bigint', name: 'absolute_change' })
  absolute_change: number;

  @Column({ type: 'numeric', name: 'percentage_change', nullable: true })
  percentage_change: number;
} 