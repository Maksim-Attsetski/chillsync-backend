import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

import Config from './config';
import { AuthModule, UsersModule } from 'src/api';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: Config.isDev ? '.env.dev' : `.env.prod`,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'static'),
    }),
    // TelegrafModule.forRoot({
    //   middlewares: [sessions.middleware()],
    //   token: process.env.TG_KEY,
    // }),
    MongooseModule.forRoot(process.env.DB_URL!),
    AuthModule,
    UsersModule,
  ],
  // providers: [AppUpdate],
})
export class AppModule {}
