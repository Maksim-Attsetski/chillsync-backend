import { Module } from '@nestjs/common';
import { MovieReactionModule, TmdbModule } from 'src/api';
import { RoomsStoreModule } from 'src/api/rooms';

import { RoomsGateway } from './rooms.gateway';

@Module({
  imports: [RoomsStoreModule, MovieReactionModule, TmdbModule],
  providers: [RoomsGateway], // добавляем как provider
})
export class RoomsModule {}
