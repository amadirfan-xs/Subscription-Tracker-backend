import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '@/users/entities/user.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from '@/mail/mail.service';

import { LoginSession } from './entities/login-session.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(PasswordReset)
        private passwordResetRepository: Repository<PasswordReset>,
        @InjectRepository(LoginSession)
        private loginSessionRepository: Repository<LoginSession>,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async register(registerDto: RegisterDto): Promise<any> {
        const { email, password, firstName, lastName } = registerDto;

        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });

        await this.userRepository.save(user);

        // Remove password from response
        const { password: _, ...result } = user;
        return result;
    }

    async login(loginDto: LoginDto, metadata: { ip: string, userAgent: string }): Promise<{ accessToken: string }> {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            const payload = { sub: user.id, email: user.email };

            // Record Session
            const session = this.loginSessionRepository.create({
                ip: metadata.ip,
                userAgent: metadata.userAgent,
                user: user,
            });
            await this.loginSessionRepository.save(session);

            return {
                accessToken: await this.jwtService.signAsync(payload),
            };
        } else {
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        const { email } = forgotPasswordDto;
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

        const passwordReset = this.passwordResetRepository.create({
            token,
            expiresAt,
            user,
        });

        await this.passwordResetRepository.save(passwordReset);

        // In a real app, send an email here. We dispatch to the mock mail service which echoes the URL.
        await this.mailService.sendPasswordResetEmail(email, token);
        return { message: 'Password reset link sent to your email' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        const { token, password } = resetPasswordDto;

        const resetRequest = await this.passwordResetRepository.findOne({
            where: {
                token,
                expiresAt: MoreThan(new Date())
            },
            relations: ['user'],
        });

        if (!resetRequest) {
            throw new BadRequestException('Invalid or expired token');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        resetRequest.user.password = hashedPassword;
        await this.userRepository.save(resetRequest.user);

        // Delete the used token
        await this.passwordResetRepository.remove(resetRequest);

        return { message: 'Password has been reset successfully' };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new BadRequestException('Incorrect current password');
        }

        const isReusing = await bcrypt.compare(newPassword, user.password);
        if (isReusing) {
            throw new BadRequestException('New password must be different from the current password');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedNewPassword;
        user.lastPasswordChange = new Date();
        await this.userRepository.save(user);

        return { message: 'Password has been updated successfully' };
    }

    async getLoginSessions(userId: string): Promise<LoginSession[]> {
        return this.loginSessionRepository.find({
            where: { user: { id: userId } },
            order: { lastSeenAt: 'DESC' },
            take: 5,
        });
    }

    async validateGoogleUser(details: any): Promise<User> {
        const { email, firstName, lastName, picture } = details;
        let user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            // Register a new user dynamically if they didn't exist
            user = this.userRepository.create({
                email,
                firstName,
                lastName,
                avatarUrl: picture,
                // Assign a randomized hard-to-guess password since they authenticate through Google
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 12),
            });
            await this.userRepository.save(user);
        }

        return user;
    }

    async createSessionRecord(user: User, ip: string, userAgent: string): Promise<void> {
        const session = this.loginSessionRepository.create({
            ip,
            userAgent,
            user,
        });
        await this.loginSessionRepository.save(session);
    }
}
