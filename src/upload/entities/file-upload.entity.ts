import { LiveModel } from "src/live/entities/live.entity";
import { PlayTicketSaleModel } from "src/play/entities/play-ticket-sale.entity";
import { PlayShowSaleModel } from "src/play/entities/play-show-sale.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { format } from 'date-fns';
import { ConcertTicketSaleModel } from "src/concert/entities/concert-ticket-sale.entity";
import { ConcertSeatSaleModel } from "src/concert/entities/concert-seat-sale.entity";

@Entity()
export class FileUploadModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fileName: string;

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

    @ManyToOne(() => LiveModel, (live) => live.uploadFile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'liveId', referencedColumnName: 'liveId', })
    live: LiveModel;

    @OneToMany(() => PlayTicketSaleModel, (daily) => daily.playUpload, { nullable: true })
    dailySaleData: PlayTicketSaleModel[];

    @OneToMany(() => PlayShowSaleModel, (show) => show.playUpload, { nullable: true })
    showSaleData: PlayShowSaleModel[];

    @OneToMany(() => ConcertTicketSaleModel, (concert) => concert.concertUpload, { nullable: true })
    concertSaleData: ConcertTicketSaleModel[];

    @OneToMany(() => ConcertSeatSaleModel, (concert) => concert.concertUpload, { nullable: true })
    concertSeatSaleData: ConcertSeatSaleModel[];

    @Column()
    uploadBy: string;

    @Column({ default: false })
    isSavedFile: boolean;

    @CreateDateColumn()
    uploadDate: Date;

    @DeleteDateColumn()
    deleteDate: Date;
}
