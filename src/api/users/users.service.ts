import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { Errors, IQuery, MongoUtils } from 'src/utils';

import { FriendService } from '../friends';
import { MailService } from '../mail';
import { MovieReactionService } from '../movie-reactions';
import { SessionsService } from '../sessions';
import { ERoles } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users, UsersDocument } from './users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private userModel: Model<UsersDocument>,
    @Inject(forwardRef(() => SessionsService))
    private sessionsService: SessionsService,
    @Inject(forwardRef(() => FriendService))
    private friendService: FriendService,
    @Inject(forwardRef(() => MovieReactionService))
    private movieReactionService: MovieReactionService,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
  ) {}

  async findAll(query: IQuery) {
    return await MongoUtils.getAll({
      model: this.userModel,
      query,
      dto: GetUserDto,
    });
  }

  async checkEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return !!user;
  }

  async findOne(id: string, isFull?: boolean) {
    return await MongoUtils.get({
      model: this.userModel,
      id,
      error: 'User',
      dto: isFull ? GetUserDto : false,
    });
  }

  async update(id: string, updateUserDto: Partial<UpdateUserDto>) {
    delete updateUserDto['password'];
    delete updateUserDto['role'];

    return await MongoUtils.update({
      model: this.userModel,
      id,
      data: updateUserDto,
      dto: GetUserDto,
      error: 'User',
    });
  }

  async updatePassword(
    id: string,
    updateUserDto: { last: string; new: string },
  ) {
    try {
      const user = await this.userModel.findById(id);

      if (!user) throw Errors.notFound('user');

      const isPassEqual = await compare(updateUserDto.last, user?.password);
      if (!isPassEqual) throw Errors.badRequest('Старый пароль неверный');

      const hashPassword = await hash(updateUserDto.new, 7);
      user.password = hashPassword;
      user.updated_at = new Date();

      void this.mailService.sendEmailAfterChangePass(
        `${user?.first_name} ${user.last_name}`,
        user?.email,
      );

      await user.save();
      return true;
    } catch (error) {
      if (!error?.status) {
        throw Errors.undefinedError(error?.message ?? error);
      } else {
        throw error;
      }
    }
  }

  async updateRole(id: string, updateUserDto: { role: ERoles }) {
    const user = await this.userModel.findById(id);

    if (!user) throw Errors.notFound('user');

    user.role = updateUserDto.role;
    user.updated_at = new Date();

    await user.save();
    return true;
  }

  async remove(id: string) {
    await this.sessionsService.delete({ user_id: id, user_agent: '' }, true);

    await this.friendService.remove(id, true);
    await this.movieReactionService.remove(id, true);

    return await MongoUtils.delete({
      model: this.userModel,
      id,
      error: 'User',
    });
  }
}
