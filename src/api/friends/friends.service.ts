import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateFriendDto } from './dto/create-friends.dto';
import { GetFriendDto } from './dto/get-friends.dto';
import { Friend, FriendDocument } from './friends.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectModel(Friend.name)
    private friendModel: Model<FriendDocument>,
  ) {}

  async sendRequest(createFriendDto: CreateFriendDto, userId: string) {
    return await MongoUtils.create({
      model: this.friendModel,
      data: {
        ...createFriendDto,
        user_ids: [createFriendDto.user_id, userId],
        waiter: userId,
      },
      dto: GetFriendDto,
    });
  }

  async acceptRequest(id: string) {
    return await MongoUtils.update({
      model: this.friendModel,
      data: { waiter: null, message: null },
      id,
      dto: GetFriendDto,
    });
  }

  async removeFriend(id: string, userId: string) {
    try {
      const item = await this.friendModel.findById(id);
      if (!item) throw Errors.notFound('Friend ');

      item.waiter = item.user_ids[String(item.user_ids[0]) === userId ? 1 : 0];
      item.updated_at = Date.now();

      await item.save();
      return await item.populate(Object.keys(new GetFriendDto()));
    } catch (error) {
      console.log('error', error);
      if (error?.code === 11000)
        throw Errors.dublicate(error, Object.keys(error?.keyPattern ?? {}));
      throw error;
    }
  }

  async findAll(query: IQuery) {
    return await MongoUtils.getAll({
      model: this.friendModel,
      dto: GetFriendDto,
      query,
    });
  }

  async findFor(userId: string) {
    const allUsers = await this.friendModel.find({ user_ids: userId });

    const friends = allUsers.filter((v) => v.waiter === null);
    const subs = allUsers.filter(
      (v) => v.waiter !== null && String(v?.waiter as any) !== userId,
    );
    const followers = allUsers.filter(
      (v) => v.waiter !== null && String(v.waiter as any) === userId,
    );

    return { friends, subs, followers };
  }

  async findForStat(userId: string) {
    const allUsers = await this.friendModel.find({ user_ids: userId });

    const friends = allUsers.filter((v) => v.waiter === null).length;
    const subs = allUsers.filter(
      (v) => v.waiter !== null && String(v?.waiter as any) !== userId,
    ).length;
    const followers = allUsers.filter(
      (v) => v.waiter !== null && String(v.waiter as any) === userId,
    ).length;

    return { friends, subs, followers };
  }

  async findOne(id: string) {
    return await MongoUtils.get({
      model: this.friendModel,
      error: 'Friend',
      id,
      dto: GetFriendDto,
    });
  }

  async remove(id: string, isUserId = false) {
    if (isUserId) {
      await this.friendModel.deleteMany({ user_ids: { $in: id } });
      return 'success';
    }

    const item = await this.friendModel.findByIdAndDelete(id);

    if (!item) throw Errors.notFound('Friend');
    return item._id;
  }
}
