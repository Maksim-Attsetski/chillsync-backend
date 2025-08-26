import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards';
import { MailService } from 'src/api/mail/mail.service';
import { type ISendDto } from './dto/send.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() dto: ISendDto) {
    return this.mailService.sendMail(dto);
  }
}
