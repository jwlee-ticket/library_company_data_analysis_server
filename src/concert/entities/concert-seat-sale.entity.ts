import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { FileUploadModel } from "src/upload/entities/file-upload.entity";
import { CreateDateColumn } from "typeorm";
import { format } from "date-fns";

@Entity()
export class ConcertSeatSaleModel {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => FileUploadModel, (upload) => upload.concertSaleData, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'concertUploadId', referencedColumnName: 'id' })
    concertUpload: FileUploadModel;

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

    @Column()
    showDateTime: Date;

    @Column()
    liveId: string;

    @Column({ nullable: true })
    paidSeatR: number;

    @Column({ nullable: true })
    paidSeatS: number;

    @Column({ nullable: true })
    paidSeatA: number;

    @Column({ nullable: true })
    paidSeatB: number;

    @Column({ nullable: true, default: 0 })
    paidSeatVip: number;

    @Column({ nullable: true })
    paidSeatTot: number;

    @Column({ nullable: true })
    inviteSeatR: number;

    @Column({ nullable: true })
    inviteSeatS: number;

    @Column({ nullable: true })
    inviteSeatA: number;

    @Column({ nullable: true })
    inviteSeatB: number;

    @Column({ nullable: true, default: 0 })
    inviteSeatVip: number;

    @Column({ nullable: true })
    inviteSeatTot: number;

    @CreateDateColumn()
    createdAt: Date;
}
