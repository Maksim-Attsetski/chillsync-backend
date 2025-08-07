import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateFriendDto } from './dto/create-friends.dto';
import { UpdateFriendDto } from './dto/update-friends.dto';
import { Friend, FriendDocument } from './friends.entity';
import { GetFriendDto } from './dto/get-friends.dto';

@Injectable()
export class FriendService {
  constructor(
    @InjectModel(Friend.name)
    private friendModel: Model<FriendDocument>,
  ) {}

  async create(createFriendDto: CreateFriendDto) {
    return await MongoUtils.create({
      model: this.friendModel,
      data: createFriendDto,
      dto: GetFriendDto,
    });
  }

  async findAll(query: IQuery) {
    return await MongoUtils.getAll({
      model: this.friendModel,
      dto: GetFriendDto,
      query,
    });
  }

  async findOne(id: string) {
    return await MongoUtils.get({
      model: this.friendModel,
      error: 'Friend',
      id,
      dto: GetFriendDto,
    });
  }

  async update(id: string, updateFriendDto: UpdateFriendDto) {
    return await MongoUtils.update({
      model: this.friendModel,
      error: 'Friend',
      id,
      data: updateFriendDto,
      dto: GetFriendDto,
    });
  }

  async remove(id: string, isUserId = false) {
    if (isUserId) {
      await this.friendModel.deleteMany({ user_ids: { $in: id } });
      await this.friendModel.deleteMany({ waiter: id });
      return 'success';
    }

    const item = await this.friendModel.findByIdAndDelete(id);

    if (!item) throw Errors.notFound('Friend');
    return item._id;
  }
}
