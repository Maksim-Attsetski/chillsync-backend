import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateMovieReactionDto } from './dto/create-movie-reaction.dto';
import { UpdateMovieReactionDto } from './dto/update-movie.dto';
import { MovieReaction, MovieReactionDocument } from './movie-reactions.entity';
import { GetMovieReactionDto } from './dto/get-movie.dto';

@Injectable()
export class MovieReactionService {
  constructor(
    @InjectModel(MovieReaction.name)
    private movieReactionModel: Model<MovieReactionDocument>,
  ) {}

  async create(createDto: CreateMovieReactionDto) {
    return await MongoUtils.create({
      model: this.movieReactionModel,
      data: { ...createDto },
    });
  }

  async findAll(query: IQuery) {
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
