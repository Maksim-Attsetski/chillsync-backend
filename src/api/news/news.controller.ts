import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { type IQuery } from 'src/utils';

import { type IFile } from 'src/modules/files';
import { IsAdminGuard } from 'src/guards';

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
    return this.newsService.create(createNewsDto, preview);
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
