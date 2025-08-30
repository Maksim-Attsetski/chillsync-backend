import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { Session, SessionSchema } from './sessions.entity';
import { SessionController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { MailModule } from '../mail';

export const SessionsModel = MongooseModule.forFeature([
  { name: Session.name, schema: SessionSchema },
]);

@Module({
  imports: [JwtModule, SessionsModel, forwardRef(() => MailModule)],
  controllers: [SessionController],
  providers: [SessionsService],
  exports: [SessionsService, JwtModule],
})
export class SessionsModule {}
