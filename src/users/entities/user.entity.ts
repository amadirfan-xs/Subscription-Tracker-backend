import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Subscription } from '@/subscriptions/entities/subscription.entity';
import { LoginSession } from '@/auth/entities/login-session.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ nullable: true })
    displayName: string;

    @Column({ nullable: true })
    professionalRole: string;

    @Column({ nullable: true })
    reportingCurrency: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @Column({ nullable: true })
    lastPasswordChange: Date;

    @Column({ default: true })
    emailDigest: boolean;

    @Column({ default: true })
    trialAlerts: boolean;

    @Column({ default: true })
    pushAlerts: boolean;

    @Column({ default: false })
    smsAlerts: boolean;

    @Column({ nullable: true })
    primaryEmail: string;

    @Column({ default: true })
    marketInsights: boolean;

    @Column({ default: true })
    ledgerDigest: boolean;

    @Column({ default: false })
    partnerOffers: boolean;

    @Column({ default: 'indigo-dark' })
    emailAesthetics: string;

    @Column({
        type: 'enum',
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly',
    })
    reportFrequency: string;

    @Column({ type: 'float', default: 2500 })
    monthlyLimit: number;

    @Column({ default: 'USD' })
    baseCurrency: string;

    @Column({ default: true })
    lowBalanceIntelligence: boolean;

    @Column({ type: 'simple-json', nullable: true })
    categoryBudgets: { entertainment: number, productivity: number, utilities: number };

    @OneToMany(() => Subscription, (subscription) => subscription.user)
    subscriptions: Subscription[];

    @OneToMany(() => LoginSession, (session) => session.user)
    loginSessions: LoginSession[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
