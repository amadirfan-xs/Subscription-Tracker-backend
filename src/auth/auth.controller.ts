import { Controller, Post, Get, Body, HttpCode, HttpStatus, ValidationPipe, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private jwtService: JwtService
    ) { }

    @Post('register')
    register(@Body(new ValidationPipe()) registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Request() req: any, @Body(new ValidationPipe()) loginDto: LoginDto) {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        return this.authService.login(loginDto, { ip, userAgent });
    }

    @HttpCode(HttpStatus.OK)
    @Post('forgot-password')
    forgotPassword(@Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('reset-password')
    resetPassword(@Body(new ValidationPipe()) resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('change-password')
    changePassword(@Request() req: any, @Body(new ValidationPipe()) changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(
            req.user.id,
            changePasswordDto.currentPassword,
            changePasswordDto.newPassword,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('sessions')
    getSessions(@Request() req: any) {
        return this.authService.getLoginSessions(req.user.id);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Request() req: any) {
        // Initiates the Google OAuth2 login flow
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Request() req: any, @Res() res: any) {
        const user = req.user;
        const payload = { sub: user.id, email: user.email };

        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        await this.authService.createSessionRecord(user, ip, userAgent);
        const token = await this.jwtService.signAsync(payload);

        return res.redirect(`http://localhost:3000/auth/google/callback?token=${token}`);
    }
}
