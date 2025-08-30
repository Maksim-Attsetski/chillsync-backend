import { Module } from '@nestjs/common';
import { RoomsGateway } from './rooms.gateway';
import { MovieModule, TmdbModule } from 'src/api';

@Module({
  imports: [MovieModule, TmdbModule],
  providers: [RoomsGateway], // добавляем как provider
})
export class RoomsModule {}
