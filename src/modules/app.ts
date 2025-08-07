import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

import Config from './config';
import {
  AuthModule,
  UsersModule,
  FriendModule,
  NewsModule,
  PingModule,
  SubscriptionModule,
} from 'src/api';
import { MovieModule } from 'src/api/movies';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: Config.isDev ? '.env.dev' : `.env.prod`,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'static'),
    }),
    MongooseModule.forRoot(process.env.DB_URL!),
    AuthModule,
    UsersModule,
    FriendModule,
    NewsModule,
    SubscriptionModule,
    PingModule,
    MovieModule,
  ],
})
export class AppModule {}
