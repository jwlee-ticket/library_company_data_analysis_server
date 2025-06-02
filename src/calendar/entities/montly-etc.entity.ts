import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class MonthlyEtcModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    @Column()
    month: number;

    @Column({ type: 'text', nullable: true })
    etc: string;

    @UpdateDateColumn()
    updatedAt: Date;
}