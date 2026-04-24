import { Controller, Get, Post, Patch, Body, UseGuards, Request, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('me')
    getProfile(@Request() req) {
        return this.usersService.findOne(req.user.id);
    }

    @Patch('me')
    updateProfile(@Request() req: any, @Body() updateProfileDto: any) {
        return this.usersService.updateProfile(req.user.id, updateProfileDto);
    }

    @Post('me/avatar')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadAvatar(@Request() req: any, @UploadedFile() file: any) {
        return this.usersService.updateAvatar(req.user.id, `/uploads/avatars/${file.filename}`);
    }

    @Patch('me/notifications')
    updateNotifications(@Request() req: any, @Body() data: any) {
        return this.usersService.updateNotifications(req.user.id, data);
    }

    @Patch('me/mail')
    updateMail(@Request() req: any, @Body() data: any) {
        return this.usersService.updateMailSettings(req.user.id, data);
    }

    @HttpCode(HttpStatus.OK)
    @Patch('me/budget')
    updateBudget(@Request() req: any, @Body() data: any) {
        return this.usersService.updateBudgetSettings(req.user.id, data);
    }

    @HttpCode(HttpStatus.OK)
    @Get('me/budget/analytics')
    getBudgetAnalytics(@Request() req: any) {
        return this.usersService.getBudgetAnalytics(req.user.id);
    }
}
