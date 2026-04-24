import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './users/entities/user.entity';
import { Subscription } from './subscriptions/entities/subscription.entity';
import { UsageLog } from './subscriptions/entities/usage-log.entity';
import { PasswordReset } from './auth/entities/password-reset.entity';
import { LoginSession } from './auth/entities/login-session.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { Budget } from './budgets/entities/budget.entity';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Subscription, UsageLog, PasswordReset, Budget, LoginSession],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    SubscriptionsModule,
    BudgetsModule,
    UsersModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
