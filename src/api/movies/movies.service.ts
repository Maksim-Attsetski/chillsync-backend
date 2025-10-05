import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { GetMovieDto } from './dto/get-movie.dto';
import { Movie, MovieDocument } from './movies.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
  ) {}

  async createManyMovies(dtoList: CreateMovieDto[]) {
    await this.movieModel.bulkWrite(
      dtoList.map((obj) => ({
        updateOne: {
          filter: { id: obj?.id }, // например email
          update: { $set: obj },
          upsert: true,
        },
      })),
    );

    const movies = await this.movieModel.find({
      id: { $in: dtoList.map((d) => d.id) },
    });
    return movies;
  }

  async findAll(query: IQuery) {
    return await MongoUtils.getAll({
      model: this.movieModel,
      dto: GetMovieDto,
      query,
    });
  }

  async findOne(id: string) {
    return await MongoUtils.get({
      model: this.movieModel,
      error: 'Movie',
      id,
      dto: GetMovieDto,
    });
  }

  async update(id: string, updateMovieDto: UpdateMovieDto) {
    return await MongoUtils.update({
      model: this.movieModel,
      error: 'Movie',
      id,
      data: updateMovieDto,
    });
  }

  async remove(id: string) {
    const item = await this.movieModel.findByIdAndDelete(id);

    if (!item) throw Errors.notFound('Movie');
    return item._id;
  }
}
