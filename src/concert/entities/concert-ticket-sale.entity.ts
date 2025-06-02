import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { FileUploadModel } from "src/upload/entities/file-upload.entity";
import { format } from "date-fns";
import { CreateDateColumn } from "typeorm";

@Entity()
export class ConcertTicketSaleModel {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => FileUploadModel, (upload) => upload.concertSaleData, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'concertUploadId', referencedColumnName: 'id' })
    concertUpload: FileUploadModel;

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
    paidSeatTot: number;

    @Column()
    inviteSeatTot: number;

    @CreateDateColumn()
    createdAt: Date;
}
