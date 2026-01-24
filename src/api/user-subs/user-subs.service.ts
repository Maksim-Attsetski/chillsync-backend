import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateUserSubDto } from './dto/create.dto';
import { GetUserSubDto as GetSubsDto } from './dto/get.dto';
import { UpdateUserSubDto as UpdateSubsDto } from './dto/update.dto';
import { userSubDocument, UserSubscription } from './user-subs.entity';

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
  async findByUser(user_id: string) {
    const sub = await this.subsModel.findOne({ user_id }).populate('sub_id');

    if (!sub) return Errors.notFound('Subscribe');
    return sub;
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
