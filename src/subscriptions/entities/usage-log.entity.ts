import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity('usage_logs')
export class UsageLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number; // e.g. hours

    @Column()
    date: Date;

    @ManyToOne(() => Subscription, (subscription) => subscription.usageLogs, { onDelete: 'CASCADE' })
    subscription: Subscription;

    @CreateDateColumn()
    createdAt: Date;
}
