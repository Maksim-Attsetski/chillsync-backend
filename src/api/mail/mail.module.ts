// mail.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { AuthModule } from '../auth';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
