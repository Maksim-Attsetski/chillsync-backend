import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateUserSubDto } from './dto/create.dto';
import { UpdateUserSubDto as UpdateSubsDto } from './dto/update.dto';
import { UserSubscription, userSubDocument } from './user-subs.entity';
import { GetUserSubDto as GetSubsDto } from './dto/get.dto';

@Injectable()
export class UserSubsService {
  constructor(
    @InjectModel(UserSubscription.name)
    private subsModel: Model<userSubDocument>,
  ) {}

  async create(createDto: CreateUserSubDto) {
    return await MongoUtils.create({
      model: this.subsModel,
      data: createDto,
    });
  }

  async findAll(query: IQuery) {
    return await MongoUtils.getAll({
      model: this.subsModel,
      dto: GetSubsDto,
      query,
    });
  }

  async findOne(id: string) {
    return await MongoUtils.get({
      model: this.subsModel,
      error: 'Subscription',
      id,
      dto: GetSubsDto,
    });
  }

  async update(id: string, updateDto: UpdateSubsDto) {
    return await MongoUtils.update({
      model: this.subsModel,
      error: 'Subscription',
      id,
      data: updateDto,
    });
  }

  async remove(id: string) {
    const item = await this.subsModel.findByIdAndDelete(id);

    if (!item) throw Errors.notFound('Subscription');
    return item._id;
  }
}
