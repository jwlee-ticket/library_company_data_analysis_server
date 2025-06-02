import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class CalendarModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: Date;

    @Column({ nullable: true })
    noteSales: string;

    @Column({ nullable: true })
    noteMarketing: string;

    @Column({ nullable: true })
    noteOthers: string;

    @CreateDateColumn()
    createdAt: Date;
}
