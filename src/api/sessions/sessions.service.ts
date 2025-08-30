import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateSessionDto as CreateDto } from './dto/create.dto';
import { UpdateSessionDto as UpdateDto } from './dto/update.dto';
import { Session, SessionDocument } from './sessions.entity';
import { GetSessionDto as GetDto } from './dto/get.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private SessionsModel: Model<SessionDocument>,
  ) {}

  async create(createSessionsDto: CreateDto) {
    return await MongoUtils.create({
      model: this.SessionsModel,
      data: createSessionsDto,
    });
  }

  async findAll(query: IQuery) {
    return await MongoUtils.getAll({
      model: this.SessionsModel,
      dto: GetDto,
      query,
    });
  }

  async findOne(id: string) {
    return await MongoUtils.get({
      model: this.SessionsModel,
      error: 'Session',
      id,
      dto: GetDto,
    });
  }

  async update(id: string, updateSessionsDto: UpdateDto) {
    return await MongoUtils.update({
      model: this.SessionsModel,
      error: 'Session',
      id,
      data: updateSessionsDto,
    });
  }

  async remove(id: string, isUserId?: boolean) {
    if (isUserId) {
      await this.SessionsModel.deleteMany({ user_id: id });
      return 'success';
    }

    const item = await this.SessionsModel.findByIdAndDelete(id);

    if (!item) throw Errors.notFound('Session');
    return item._id;
  }
}
