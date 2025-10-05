import { Module } from '@nestjs/common';
import { RoomsGateway } from './rooms.gateway';
import { MovieReactionModule, TmdbModule } from 'src/api';

@Module({
  imports: [MovieReactionModule, TmdbModule],
  providers: [RoomsGateway], // добавляем как provider
})
export class RoomsModule {}
