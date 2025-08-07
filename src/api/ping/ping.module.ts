import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PingService } from './ping.service';
import { PingController } from './ping.controller';

@Module({
  imports: [HttpModule],
  providers: [PingService],
  controllers: [PingController],
})
export class PingModule {}
