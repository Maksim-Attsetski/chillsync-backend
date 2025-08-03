import { InjectModel } from '@nestjs/mongoose';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { compare, hash } from 'bcryptjs';

import { MongoUtils, IQuery, Errors } from 'src/utils';

import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { Users, UsersDocument } from './users.entity';
import { AuthService } from '../auth';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(Users.name) private userModel: Model<UsersDocument>,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
  ) {}

  async findAll(query: IQuery) {
    return await MongoUtils.getAll({
      model: this.userModel,
      query,
      dto: GetUserDto,
    });
  }

  async findOne(id: string, isFull?: boolean) {
    return await MongoUtils.get({
      model: this.userModel,
      id,
      error: 'User',
      dto: isFull ? GetUserDto : false,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
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
    const user = await this.userModel.findById(id);

    if (!user) throw Errors.notFound('user');

    const isPassEqual = await compare(updateUserDto.last, user?.password);
    if (!isPassEqual) throw Errors.badRequest('Old password is wrong');

    const hashPassword = await hash(updateUserDto.new, 7);
    user.password = hashPassword;
    await user.save();

    return true;
  }

  async remove(id: string) {
    await this.authService.deleteToken({ userID: id });
    return await MongoUtils.delete({
      model: this.userModel,
      id,
      error: 'User',
    });
  }
}
