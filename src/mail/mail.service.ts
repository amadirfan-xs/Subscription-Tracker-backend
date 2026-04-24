import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Scaffolding a base transporter. Using Ethereal/mock for current dev.
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
        pass: process.env.SMTP_PASS || 'etherealPass123',
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

    this.logger.log(
      `\n\n=======================================================\nPASSWORD RESET LINK GENERATED FOR: ${email}\n[SIMULATED EMAIL DISPATCH - NO REAL SMTP REQUIRED!]\n\nClick this exact link to reset your password:\n${resetLink}\n=======================================================\n\n`,
    );

    try {
      // Note: unless you provide real SMTP credentials, this transporter.sendMail might fail or reject on actual send, so we will wrap it and not crash if it fails, since we dumped the link to console.
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        await this.transporter.sendMail({
          from: '"The Ledger Security" <noreply@theledger.com>',
          to: email,
          subject: 'Password Reset Request',
          text: `You requested a password reset. Please click this link to reset your password: ${resetLink} \n\nIf you did not request this, please ignore this email.`,
          html: `
                        <p>You requested a password reset.</p>
                        <p>Please click the link below to securely reset your password:</p>
                        <a href="${resetLink}">${resetLink}</a>
                        <br/>
                        <br/>
                        <p>If you did not request this, please ignore this email.</p>
                    `,
        });
      }
    } catch (err) {
      this.logger.error(
        'Failed to send actual email via SMTP (Console link remains available)',
        err,
      );
    }
  }
}
