import { format } from "date-fns";
import { LiveModel } from "src/live/entities/live.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class WeeklyMarketingCalendarModel {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => LiveModel, (live) => live.marketingCalendar, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'liveId', referencedColumnName: 'liveId' })
    live: LiveModel;

    @Column()
    weekNumber: number;

    @Column({
        transformer: {
            to: (value: Date): Date => value,
            from: (value: Date | null): string | null => {
                // null 체크
                if (!value) return null;

                // 유효한 날짜인지 확인
                const timestamp = Date.parse(value.toString());
                if (isNaN(timestamp)) return null;

                try {
                    return format(value, 'yyyy-MM-dd');
                } catch (error) {
                    console.error("Date formatting error:", error);
                    return null;
                }
            }
        }
    })
    weekStartDate: Date;

    @Column({
        transformer: {
            to: (value: Date): Date => value,
            from: (value: Date | null): string | null => {
                // null 체크
                if (!value) return null;

                // 유효한 날짜인지 확인
                const timestamp = Date.parse(value.toString());
                if (isNaN(timestamp)) return null;

                try {
                    return format(value, 'yyyy-MM-dd');
                } catch (error) {
                    console.error("Date formatting error:", error);
                    return null;
                }
            }
        }
    })
    weekEndDate: Date;

    @Column({ type: 'text', nullable: true })
    salesMarketing: string;

    @Column({ type: 'text', nullable: true })
    promotion: string;

    @Column({ type: 'text', nullable: true })
    etc: string;

    @CreateDateColumn()
    createdAt: Date;
}
