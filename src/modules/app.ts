import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import {
  AuthModule,
  FriendModule,
  MailModule,
  MovieModule,
  MovieReactionModule,
  NewsModule,
  PingModule,
  SessionsModule,
  SettingsModule,
  SubscriptionModule,
  TmdbModule,
  UsersModule,
  UserSubsModule,
  StatsModule,
} from 'src/api';
import { RoomsStoreModule } from 'src/api/rooms';
import { RoomsModule } from 'src/sockets';

const node_env = process.env.NODE_ENV;
const isDev = !node_env || node_env === 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: isDev ? '.env.dev' : `.env.prod`,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'static'),
    }),
    MongooseModule.forRoot(process.env.DB_URL!),
    MailModule,
    SessionsModule,
    AuthModule,
    UsersModule,
    FriendModule,
    NewsModule,
    SubscriptionModule,
    PingModule,
    MovieModule,
    MovieReactionModule,
    TmdbModule,
    UserSubsModule,
    SettingsModule,

    StatsModule,

    RoomsStoreModule,
    // sockets
    RoomsModule,
  ],
})
export class AppModule {}
