// mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ISendDto } from './dto/send.dto';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  // список SMTP аккаунтов (можно добавлять новые)
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true для 465, false для 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendMail({ to, subject, text, html }: ISendDto) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`);
      throw error;
    }
  }
}
