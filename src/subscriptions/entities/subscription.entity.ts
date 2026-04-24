import { User } from '@/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UsageLog } from './usage-log.entity';
import { SubscriptionStatus } from '../subscriptions.status';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column()
  billingCycle: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  planName: string;

  @Column({ nullable: true })
  paymentMethodType: string;

  @Column({ nullable: true })
  paymentMethodDetail: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column({ nullable: true })
  renewalDate: Date;

  @ManyToOne(() => User, (user) => user.subscriptions)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UsageLog, (log) => log.subscription)
  usageLogs: UsageLog[];
}
