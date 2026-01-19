import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateSettingDto } from './dto/create.dto';
import { GetSettingDto } from './dto/get.dto';
import { UpdateSettingDto } from './dto/update.dto';
import { Setting, SettingDocument } from './settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name) private settingsModel: Model<SettingDocument>,
  ) {}

  async create(createDto: CreateSettingDto) {
    return await MongoUtils.create({
      model: this.settingsModel,
      data: createDto,
    });
  }

  async findAll(query: IQuery) {
    return await MongoUtils.getAll({
      model: this.settingsModel,
      dto: GetSettingDto,
      query,
    });
  }

  async findOne(id: string) {
    return await MongoUtils.get({
      model: this.settingsModel,
      error: 'Setting',
      id,
      dto: GetSettingDto,
    });
  }

  async update(id: string, updateDto: UpdateSettingDto) {
    return await MongoUtils.update({
      model: this.settingsModel,
      error: 'Setting',
      id,
      data: updateDto,
    });
  }

  async remove(id: string) {
    const item = await this.settingsModel.findByIdAndDelete(id);

    if (!item) throw Errors.notFound('Setting');

    return item._id;
  }
}
