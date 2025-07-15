import { Entity, Column, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_play_overall_revenue_analysis',
  synchronize: false,
})
export class ViewPlayOverallRevenueAnalysis {
  @Column({ type: 'varchar', name: 'liveId', primary: true })
  liveId: string;

  @Column({ type: 'varchar', name: 'liveName' })
  liveName: string;

  @Column({ type: 'varchar', name: 'category' })
  category: string;

  @Column({ type: 'bigint', name: 'total_sales' })
  total_sales: number;

  @Column({ type: 'bigint', name: 'total_target' })
  total_target: number;

  @Column({ type: 'numeric', name: 'total_sales_target_ratio', nullable: true })
  total_sales_target_ratio: number;

  @Column({ type: 'bigint', name: 'latest_day_sales' })
  latest_day_sales: number;

  @Column({ type: 'integer', name: 'latest_day_target' })
  latest_day_target: number;

  @Column({ type: 'numeric', name: 'latest_day_sales_target_ratio', nullable: true })
  latest_day_sales_target_ratio: number;

  @Column({ type: 'date', name: 'latestRecordDate' })
  latestRecordDate: string;
} 