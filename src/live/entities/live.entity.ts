import { FileUploadModel } from "src/upload/entities/file-upload.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DailyTargetModel } from "src/target/entities/daily-target.entity";
import { WeeklyMarketingCalendarModel } from "src/marketing/entities/weekly-marketing-calendar.entity";
import { format } from 'date-fns';


@Entity()
export class LiveModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    liveId: string;

    @Column({ type: 'text', nullable: true })
    category: string;

    @Column({ default: true })
    isLive: boolean;

    @Column()
    liveName: string;

    @Column({ nullable: true })
    location: string;

    @Column(
        {
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
        }
    )
    showStartDate: Date;

    @Column(
        {
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
        }
    )
    showEndDate: Date;

    @Column({
        nullable: true, transformer: {
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
    saleStartDate: Date;

    @Column({
        nullable: true, transformer: {
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
    saleEndDate: Date;

    @Column({ nullable: true })
    runningTime: number;

    @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true })
    targetShare: number;

    @Column({ type: 'bigint', nullable: true })
    bep: number;

    @Column({ nullable: true, default: 0 })
    showTotalSeatNumber: number;

    @Column({
        nullable: true, transformer: {
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
    previewEndingDate: Date;

    @Column({
        nullable: true, transformer: {
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
    latestRecordDate: Date;

    @OneToMany(() => FileUploadModel, (file) => file.live, {
        nullable: true, cascade: true, onDelete: 'CASCADE'
    })
    uploadFile: FileUploadModel[];

    @OneToMany(() => DailyTargetModel, (weeklyTarget) => weeklyTarget.live, {
        nullable: true, cascade: true, onDelete: 'CASCADE'
    })
    dailyTarget: DailyTargetModel[];

    @OneToMany(() => WeeklyMarketingCalendarModel, (marketing) => marketing.live, {
        nullable: true, cascade: true, onDelete: 'CASCADE'
    })
    marketingCalendar: WeeklyMarketingCalendarModel[];

    @Column({ nullable: true })
    concertDateTime: Date;

    @Column({ nullable: true })
    concertSeatNumberR: number;

    @Column({ nullable: true })
    concertSeatNumberS: number;

    @Column({ nullable: true })
    concertSeatNumberA: number;

    @Column({ nullable: true })
    concertSeatNumberB: number;

    @Column({ nullable: true })
    concertSeatNumberVip: number;

    @CreateDateColumn()
    createdAt: Date;
}