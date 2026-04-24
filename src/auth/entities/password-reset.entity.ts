import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '@/users/entities/user.entity';

@Entity('password_resets')
export class PasswordReset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    token: string;

    @Column()
    expiresAt: Date;

    @ManyToOne(() => User)
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
