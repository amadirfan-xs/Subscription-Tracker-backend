import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/users/entities/user.entity';
import { CronService } from './cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [CronService],
  exports: [CronService],
})
export class NotificationsModule {}
