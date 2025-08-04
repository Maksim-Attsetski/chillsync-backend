import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateSubDto as CreateSubsDto } from './dto/create-sub.dto';
import { UpdateSubDto as UpdateSubsDto } from './dto/update-sub.dto';
import { Subscription, subscriptionDocument } from './subscriptions.entity';
import { GetSubDto as GetSubsDto } from './dto/get-sub.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subsModel: Model<subscriptionDocument>,
  ) {}

  async create(createSubsDto: CreateSubsDto) {
    return await MongoUtils.create({
      model: this.subsModel,
      data: createSubsDto,
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
