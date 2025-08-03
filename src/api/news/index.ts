import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NewsModule } from './news.module';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { GetNewsDto } from './dto/get-news.dto';
export * from './news.entity';

export {
  NewsService,
  NewsController,
  NewsModule,
  // dto
  CreateNewsDto,
  UpdateNewsDto,
  GetNewsDto,
};
