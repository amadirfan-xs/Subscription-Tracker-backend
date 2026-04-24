import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '@/users/entities/user.entity';

@Entity('login_sessions')
export class LoginSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    ip: string;

    @Column()
    userAgent: string;

    @Column({ nullable: true })
    location: string;

    @CreateDateColumn()
    loginAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastSeenAt: Date;

    @ManyToOne(() => User, (user) => user.loginSessions, { onDelete: 'CASCADE' })
    user: User;
}
