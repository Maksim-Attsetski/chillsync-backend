import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { News, NewsSchema } from './news.entity';
import { AuthModule } from '../auth';

export const newsModel = MongooseModule.forFeature([
  { name: News.name, schema: NewsSchema },
]);

@Module({
  imports: [newsModel, AuthModule],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [newsModel, NewsService],
})
export class NewsModule {}
