// mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { CreateSessionDto } from '../sessions/dto/create.dto';
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

  async sendEmailIfNewSession(dto: CreateSessionDto, email: string) {
    await this.sendMail({
      to: email,
      subject: 'Новое устройство',
      text: '',
      html: `
          <p>В ваш аккаунт был совершен вход с нового устройства ${!dto?.device_name || dto?.device_name === 'unknown' ? dto.user_agent : dto?.device_name}</p>
          <br/>
          <p>Если это были не вы, зайдите в приложение и срочно смените пароль!</p>
        `,
    });
  }

  async sendEmailAfterChangePass(userName: string, email: string) {
    await this.sendMail({
      to: email,
      subject: 'Смена пароля!',
      text: '',
      html: `
          <p>${userName}, на вашем аккаунте был изменен пароль</p>
          <br/>
          <p>Если это были не вы, зайдите в приложение и срочно смените пароль!</p>
        `,
    });
  }

  async sendEmailToNewUser(userName: string, email: string) {
    await this.sendMail({
      to: email,
      subject: `Добро пожаловать в ChillSync, ${userName}! 🍿✨`,
      text: `
Привет, ${userName}!

Добро пожаловать в ChillSync — место, где поиск идеального фильма (или сериала, книги, аниме) превращается в увлекательное приключение для тебя и твоих друзей! 🎬

Свайпай, открывай новые истории и находи то, что сделает ваш вечер особенным. Приглашай друзей, делитесь впечатлениями и находите совместные фавориты — вместе веселей и интересней!

Спасибо, что выбрал ChillSync. Мы уверены, что теперь ваши вечера будут ярче и насыщеннее.

С уважением,
Команда ChillSync
  `,
      html: `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #ff6f61; }
    p { line-height: 1.6; }
    .highlight { color: #ff6f61; font-weight: bold; }
    .button { display: inline-block; padding: 12px 20px; background-color: #ff6f61; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Добро пожаловать в ChillSync, ${userName}! 🍿✨</h1>
    <p>Привет, ${userName}!</p>
    <p>Добро пожаловать в <span class="highlight">ChillSync</span> — место, где поиск идеального фильма превращается в увлекательное приключение для тебя и твоих друзей! 🎬</p>
    <p>Свайпай, открывай новые истории и находи то, что сделает ваш вечер особенным. Приглашай друзей, делитесь впечатлениями и находите совместные фавориты — вместе веселей и интересней!</p>
    <p>Спасибо, что выбрал ChillSync. Мы уверены, что теперь ваши вечера будут ярче и насыщеннее.</p>
    <p>С уважением,<br><strong>Команда ChillSync</strong></p>
  </div>
</body>
</html>
  `,
    });
  }
}
