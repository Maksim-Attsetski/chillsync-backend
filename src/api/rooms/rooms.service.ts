import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateRoomDto } from './dto/create.dto';
import { GetRoomDto } from './dto/get.dto';
import { UpdateRoomDto } from './dto/update.dto';
import { Room, RoomsDocument } from './rooms.entity';

@Injectable()
export class RoomStoreService {
  constructor(
    @InjectModel(Room.name)
    private roomsModel: Model<RoomsDocument>,
  ) {}

  async findAll(query: IQuery) {
    return await MongoUtils.getAll<Model<RoomsDocument>, RoomsDocument>({
      model: this.roomsModel,
      dto: GetRoomDto,
      query,
    });
  }

  async create(newRoom: CreateRoomDto) {
    return await MongoUtils.create<Model<RoomsDocument>, RoomsDocument>({
      model: this.roomsModel,
      data: newRoom,
    });
  }

  async findOne(id: string) {
    return await MongoUtils.get<Model<RoomsDocument>, RoomsDocument>({
      model: this.roomsModel,
      error: 'Room',
      id,
      dto: GetRoomDto,
    });
  }

  async findByUser(id: string) {
    const res = await this.findAll({ filter: 'users_in_' + id });

    return res?.data;
  }

  async update(id: string, updateDto: UpdateRoomDto) {
    return await MongoUtils.update({
      model: this.roomsModel,
      error: 'Room',
      id,
      dto: GetRoomDto,
      data: updateDto,
    });
  }

  async remove(id: string) {
    const item = await this.roomsModel.findByIdAndDelete(id);

    if (!item) throw Errors.notFound('Room');
    return item._id;
  }
}
