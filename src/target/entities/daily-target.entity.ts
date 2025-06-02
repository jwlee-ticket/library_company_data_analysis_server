import { format } from "date-fns";
import { LiveModel } from "src/live/entities/live.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class DailyTargetModel {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => LiveModel, (live) => live.dailyTarget, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'liveId', referencedColumnName: 'liveId' })
    live: LiveModel;

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
    date: Date;

    @Column()
    target: number;

    @CreateDateColumn()
    createdAt: Date;
}