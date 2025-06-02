import { format } from "date-fns";
import { FileUploadModel } from "src/upload/entities/file-upload.entity";
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PlayShowSaleModel {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => FileUploadModel, (upload) => upload.showSaleData, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'playUploadId', referencedColumnName: 'id' })
    playUpload: FileUploadModel;

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
    liveId: string;

    @Column()
    showDateTime: Date;

    @Column({ type: 'simple-array' })
    cast: string[];

    @Column()
    paidSeatSales: number;

    @Column()
    paidSeatTot: number;

    @Column({ nullable: true })
    paidSeatVip: number;

    @Column({ nullable: true })
    paidSeatA: number;

    @Column({ nullable: true })
    paidSeatS: number;

    @Column({ nullable: true })
    paidSeatR: number;

    @Column({ nullable: true })
    paidBadSeatA: number;

    @Column({ nullable: true })
    paidBadSeatS: number;

    @Column({ nullable: true })
    paidBadSeatR: number;

    @Column({ nullable: true })
    paidDisableSeat: number;

    @Column()
    inviteSeatTot: number;

    @Column({ nullable: true })
    inviteSeatVip: number;

    @Column({ nullable: true })
    inviteSeatA: number;

    @Column({ nullable: true })
    inviteSeatS: number;

    @Column({ nullable: true })
    inviteSeatR: number;

    @Column({ nullable: true })
    inviteBadSeatA: number;

    @Column({ nullable: true })
    inviteBadSeatS: number;

    @Column({ nullable: true })
    inviteBadSeatR: number;

    @Column({ nullable: true })
    inviteDisableSeat: number;

    @Column({ type: 'decimal' })
    depositShare: number;

    @Column({ type: 'decimal' })
    paidShare: number;

    @Column({ type: 'decimal' })
    freeShare: number;
}
