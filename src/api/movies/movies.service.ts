import { InjectModel } from '@nestjs/mongoose';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie, MovieDocument } from './movies.entity';
import { GetMovieDto } from './dto/get-movie.dto';
import { MovieReactionService } from '../movie-reactions';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @Inject(forwardRef(() => MovieReactionService))
    private movieReactionService: MovieReactionService,
  ) {}

  async create(
    { reaction, ...createMovieDto }: CreateMovieDto,
    userId: string,
  ) {
    const newMovie = await this.movieModel.updateOne(
      { title: createMovieDto?.title },
      createMovieDto,
      {
        upsert: true,
      },
    );

    const id = newMovie.upsertedId as unknown as string | null;

    if (id) {
      await this.movieReactionService.create({
        movie_id: id,
        user_id: userId,
        reaction,
      });
    }

    return id;
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
