import { Module } from '@nestjs/common';
import { RoomsGateway } from './rooms.gateway';

@Module({
  providers: [RoomsGateway], // добавляем как provider
})
export class RoomsModule {}
