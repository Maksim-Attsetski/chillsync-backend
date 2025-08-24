import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateMovieReactionDto } from './dto/create-movie-reaction.dto';
import { UpdateMovieReactionDto } from './dto/update-movie.dto';
import { MovieReaction, MovieReactionDocument } from './movie-reactions.entity';
import { GetMovieReactionDto } from './dto/get-movie.dto';
import { Friend, FriendDocument } from '../friends';

@Injectable()
export class MovieReactionService {
  constructor(
    @InjectModel(MovieReaction.name)
    private movieReactionModel: Model<MovieReactionDocument>,
    @InjectModel(Friend.name)
    private friendModel: Model<FriendDocument>,
  ) {}

  async create(createDto: CreateMovieReactionDto) {
    return await MongoUtils.create({
      model: this.movieReactionModel,
      data: { ...createDto },
    });
  }

  async createMany(createDto: CreateMovieReactionDto[]) {
    return await this.movieReactionModel.insertMany(createDto);
  }

  async findAll(query: IQuery) {
    return await MongoUtils.getAll({
      model: this.movieReactionModel,
      dto: GetMovieReactionDto,
      query,
    });
  }

  async findFriendsReactions(query: IQuery, userId: string) {
    const friends = await this.friendModel.find({ user_ids: { $in: userId } });

    query.filter = `user_id_in_${friends.map((f) => (f.user_ids as unknown as string[]).at((f.user_ids as unknown as string[]).at(0) === userId ? 0 : 1)).join(',')}`;

    return await MongoUtils.getAll({
      model: this.movieReactionModel,
      dto: GetMovieReactionDto,
      query,
    });
  }

  async findOne(id: string) {
    return await MongoUtils.get({
      model: this.movieReactionModel,
      error: 'Movie reaction',
      id,
      dto: GetMovieReactionDto,
    });
  }

  async update(id: string, updateDto: UpdateMovieReactionDto) {
    return await MongoUtils.update({
      model: this.movieReactionModel,
      error: 'Movie reaction',
      id,
      data: updateDto,
    });
  }

  async remove(id: string, isUserId: boolean = false) {
    if (isUserId) {
      await this.movieReactionModel.deleteMany({ user_id: id });
      return 'success';
    }
    const item = await this.movieReactionModel.findByIdAndDelete(id);

    if (!item) throw Errors.notFound('Movie reaction');

    return item._id;
  }
}
