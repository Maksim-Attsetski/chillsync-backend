// mail.module.ts
import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
