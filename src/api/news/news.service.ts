import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { fileModule, IFile } from 'src/modules';
import { EBucketNames } from 'src/modules/supa';
import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateNewsDto } from './dto/create-news.dto';
import { GetNewsDto } from './dto/get-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { News, newsDocument } from './news.entity';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private newsModel: Model<newsDocument>) {}

  async create(createNewsDto: CreateNewsDto, preview: IFile) {
    const name = await fileModule.createFile(EBucketNames.NEWS, preview);

    if (!name) throw new Error('Не удалось прикрепить файл');

    return await MongoUtils.create({
      model: this.newsModel,
      data: {
        ...createNewsDto,
        tag: JSON.parse(createNewsDto?.tag ?? '[]'),
        preview: name,
      },
    });
  }

  async findAll(query: IQuery) {
    return await MongoUtils.getAll({
      model: this.newsModel,
      dto: GetNewsDto,
      query,
    });
  }

  async findOne(id: string) {
    return await MongoUtils.get({
      model: this.newsModel,
      error: 'News',
      id,
      dto: GetNewsDto,
    });
  }

  async update(id: string, updateNewsDto: UpdateNewsDto) {
    return await MongoUtils.update({
      model: this.newsModel,
      error: 'News',
      id,
      data: updateNewsDto,
    });
  }

  async remove(id: string) {
    const item = await this.newsModel.findByIdAndDelete(id);

    if (!item) throw Errors.notFound('News');
    if (item?.preview) {
      await fileModule.deleteFile(EBucketNames.NEWS, [item.preview]);
    }

    return item._id;
  }
}
