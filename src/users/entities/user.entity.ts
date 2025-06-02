import { LiveModel } from "src/live/entities/live.entity";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class UserModel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ unique: true })
    name: string;

    /// 0: 마스터, 1: 관리자, 2: 일반 사용자
    @Column({ default: 2 })
    role: number;

    @Column({ default: false })
    isFileUploader: boolean;

    @Column({ default: false })
    isLiveManager: boolean;

    /// 0: 전체공연 or 각 공연 id
    @Column({ type: 'text', array: true, nullable: true })
    liveNameList: string[];

    /// 0: 비활성화, 1: 활성화
    @Column({ default: false })
    status: boolean;

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}
