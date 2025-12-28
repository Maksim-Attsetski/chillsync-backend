import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsAdminGuard } from 'src/guards';
import { type IFile } from 'src/modules/files';
import { type IQuery } from 'src/utils';
import errors from 'src/utils/errors';

import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @UseGuards(IsAdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('preview'))
  async create(
    @Body() createNewsDto: CreateNewsDto,
    @UploadedFile() preview: IFile,
  ) {
    if (!preview) throw errors.badRequest('Прикрепите файл');

    try {
      return this.newsService.create(createNewsDto, preview);
    } catch (error) {
      throw errors.badRequest(error?.message);
    }
  }

  @Get()
  findAll(@Query() query: IQuery) {
    return this.newsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @UseGuards(IsAdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateNewsDto) {
    return this.newsService.update(id, updateNewsDto);
  }

  @UseGuards(IsAdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}
