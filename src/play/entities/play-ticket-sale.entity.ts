import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PlayShowSaleModel } from "./play-show-sale.entity";
import { FileUploadModel } from "src/upload/entities/file-upload.entity";
import { format } from "date-fns";

@Entity()
export class PlayTicketSaleModel {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => FileUploadModel, (upload) => upload.dailySaleData, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'playUploadId', referencedColumnName: 'id' })
    playUpload: FileUploadModel;

    @Column()
    liveId: string;

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
    recordDate: Date;

    @Column({
        transformer: {
            to: (value: Date): Date => {
                if (value) {
                    const dateOnly = new Date(value);
                    dateOnly.setHours(0, 0, 0, 0);
                    return dateOnly;
                }
                return value;
            },
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
    salesDate: Date;

    @Column()
    sales: number;

    @Column()
    seatTot: number;

    @Column({ nullable: true })
    seatVip: number;

    @Column({ nullable: true })
    seatA: number;

    @Column({ nullable: true })
    seatS: number;

    @Column({ nullable: true })
    seatR: number;

    @Column({ nullable: true })
    badSeatA: number;

    @Column({ nullable: true })
    badSeatS: number;

    @Column({ nullable: true })
    badSeatR: number;

    @Column({ nullable: true })
    disableSeat: number;

    @Column({ nullable: true })
    marketing: string;
}