import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { IQuery, MongoUtils } from 'src/utils';

import {
  CreateSessionDto as CreateDto,
  CreateSessionDto,
} from './dto/create.dto';
import { UpdateSessionDto as UpdateDto } from './dto/update.dto';
import { Session, SessionDocument } from './sessions.entity';
import { GetSessionDto as GetDto } from './dto/get.dto';
import { UsersDocument } from '../users';
import { JwtService } from '@nestjs/jwt';
import { Config } from 'src/modules';

interface ITokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private SessionsModel: Model<SessionDocument>,
    private readonly jwtService: JwtService,
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

  async getOne(dto: Pick<GetDto, 'user_agent' | 'user_id'>) {
    return await this.SessionsModel.findOne({
      user_id: dto.user_id,
      user_agent: dto.user_agent,
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

  async generateTokens({ _id, email, role }: UsersDocument): Promise<ITokens> {
    const accessToken = this.jwtService.sign(
      { email, _id, role },
      { expiresIn: '15m', secret: Config.accessSecret },
    );
    const refreshToken = this.jwtService.sign(
      { email, _id, role },
      { expiresIn: '14d', secret: Config.refreshSecret },
    );

    return { accessToken, refreshToken };
  }

  async saveSession(dto: CreateSessionDto): Promise<void> {
    const session = await this.SessionsModel.findOne({
      user_id: dto.user_id,
      user_agent: dto.user_agent,
    });

    if (session) {
      session.refreshToken = dto.refreshToken;
      session.last_active_at = new Date();
      await session.save();
    } else {
      await this.create(dto);
    }
  }

  async generateAndSaveSession(
    dto: Omit<CreateSessionDto, 'refreshToken'>,
    user: UsersDocument,
  ): Promise<ITokens> {
    const tokens = await this.generateTokens(user);
    await this.saveSession({ ...dto, refreshToken: tokens.refreshToken });

    return tokens;
  }

  async delete(
    obj: {
      user_id: string;
      user_agent: string;
    },
    all?: boolean,
  ): Promise<string> {
    if (all) {
      await this.SessionsModel.deleteMany({ user_id: obj.user_id });
      return 'success';
    }
    await this.SessionsModel.findOneAndDelete(obj);
    return 'success';
  }
}
