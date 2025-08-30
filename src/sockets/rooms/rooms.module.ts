import { Module } from '@nestjs/common';
import { RoomsGateway } from './rooms.gateway';
import { MovieModule } from 'src/api';

@Module({
  imports: [MovieModule],
  providers: [RoomsGateway], // добавляем как provider
})
export class RoomsModule {}
