import { InjectModel } from '@nestjs/mongoose';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie, MovieDocument } from './movies.entity';
import { GetMovieDto } from './dto/get-movie.dto';
import {
  MovieReactionDocument,
  MovieReactionService,
} from '../movie-reactions';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel('MovieReaction')
    private movieReactionModel: Model<MovieReactionDocument>,
    @Inject(forwardRef(() => MovieReactionService))
    private movieReactionService: MovieReactionService,
  ) {}

  async create(
    { reaction, ...createMovieDto }: CreateMovieDto,
    userId: string,
  ) {
    const newMovie = await this.movieModel.findOneAndUpdate(
      { title: createMovieDto.title },
      { $set: { ...createMovieDto } },
      { upsert: true, new: true },
    );

    const id = newMovie._id as unknown as string | null;

    if (id) {
      const newReaction = await this.movieReactionService.create({
        movie_id: id,
        user_id: userId,
        reaction,
      });

      return { reaction: newReaction, movie: newMovie };
    }

    return { reaction: null, movie: newMovie };
  }

  async createMany(dtoList: CreateMovieDto[], userId?: string) {
    if (!userId) throw Errors.unauthorized();

    const dtoObject = dtoList.reduce(
      (prev, cur) => ({ ...prev, [cur.id]: cur.reaction }),
      {} as Record<string, string>,
    );

    await this.movieModel.bulkWrite(
      dtoList.map((obj) => ({
        updateOne: {
          filter: { title: obj?.title }, // например email
          update: { $set: obj },
          upsert: true,
        },
      })),
    );

    const movies = await this.movieModel.find({
      id: { $in: dtoList.map((d) => d.id) },
    });

    await this.movieReactionModel.bulkWrite(
      movies.map((m) => ({
        insertOne: {
          document: {
            movie_id: m._id,
            user_id: userId,
            reaction: dtoObject[m.id] ?? 'LIKE',
          },
        },
      })),
    );

    const reactions = await this.movieReactionModel.find({ user_id: userId });
    return { reactions, movies };
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
    await this.movieReactionModel.deleteMany({ movie_id: id });

    return item._id;
  }
}
