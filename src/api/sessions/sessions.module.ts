import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { Session, SessionSchema } from './sessions.entity';
import { SessionController } from './sessions.controller';
import { SessionsService } from './sessions.service';

export const SessionModel = MongooseModule.forFeature([
  { name: Session.name, schema: SessionSchema },
]);

@Module({
  imports: [JwtModule, SessionModel],
  controllers: [SessionController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionModule {}
