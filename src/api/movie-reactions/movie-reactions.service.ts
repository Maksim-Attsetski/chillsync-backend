import { InjectModel } from '@nestjs/mongoose';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateMovieReactionDto } from './dto/create-movie-reaction.dto';
import { UpdateMovieReactionDto } from './dto/update-movie.dto';
import { MovieReaction, MovieReactionDocument } from './movie-reactions.entity';
import { GetMovieReactionDto } from './dto/get-movie.dto';
import { Friend, FriendDocument } from '../friends';
import {
  CreateMovieDto,
  GetMovieDto,
  Movie,
  MovieDocument,
  MovieService,
} from '../movies';

@Injectable()
export class MovieReactionService {
  constructor(
    @InjectModel(MovieReaction.name)
    private movieReactionModel: Model<MovieReactionDocument>,
    @InjectModel(Friend.name)
    private friendModel: Model<FriendDocument>,
    @InjectModel(Movie.name)
    private movieModel: Model<MovieDocument>,
    @Inject(forwardRef(() => MovieService))
    private movieService: MovieService,
  ) {}

  async create(createDto: CreateMovieReactionDto) {
    return await MongoUtils.create({
      model: this.movieReactionModel,
      data: { ...createDto },
    });
  }

  async createMany(dtoList: CreateMovieDto[], userId?: string) {
    if (!userId) throw Errors.unauthorized();

    const dtoObject = dtoList.reduce(
      (prev, cur) => ({ ...prev, [cur.id]: cur.reaction }),
      {} as Record<string, string>,
    );

    const movies = await this.movieService.createManyMovies(dtoList);

    await this.movieReactionModel.bulkWrite(
      movies.map((m) => ({
        updateOne: {
          filter: {
            movie_id: new Types.ObjectId(m._id),
            user_id: new Types.ObjectId(userId),
          },
          update: {
            movie_id: new Types.ObjectId(m._id),
            user_id: new Types.ObjectId(userId),
            reaction: dtoObject[m.id] ?? 'LIKE',
          },
          upsert: true,
        },
      })),
    );

    const reactions = await this.movieReactionModel.find({ user_id: userId });
    return { reactions, movies };
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

    query.filter = `user_id_in_${friends.map((f) => f.user_ids.at(String((f.user_ids as unknown as string[]).at(0)) === userId ? 1 : 0)).join(',')};reaction==LIKE`;

    return await MongoUtils.getAll({
      model: this.movieReactionModel,
      dto: GetMovieReactionDto,
      query,
    });
  }

  async findMoviesForMe(query: IQuery, userId: string) {
    const userReactions = await this.movieReactionModel.find({
      user_id: userId,
    });

    const newFilter = `_id_not_in_${userReactions.map((r) => r.movie_id).join(',')}`;
    if (query?.filter) {
      query.filter = query.filter + ';' + newFilter;
    } else {
      query.filter = newFilter;
    }

    return await MongoUtils.getAll({
      model: this.movieModel,
      dto: GetMovieDto,
      query,
    });
  }

  async findMoviesForUserList(userIds: string[], genres: string) {
    if (userIds.length === 0 || genres.length === 0) return [];
    const userReactions = await this.movieReactionModel.find({
      user_id: { $in: userIds },
    });

    const reactionIds = userReactions.map((r) => String(r.movie_id));
    const uniqueReactionIds = Array.from(new Set(reactionIds));

    const newFilter = `_id_not_in_${uniqueReactionIds.join(',')}`;

    const query = {
      filter: `${newFilter};vote_count>=50;genre_ids_in_${genres}`,
      sort: 'vote_average==desc',
      limit: 30,
    } as IQuery;

    return await MongoUtils.getAll({
      model: this.movieModel,
      dto: GetMovieDto,
      query,
    });
  }

  async suggestEvening(userId: string) {
    const userReactions = await this.movieReactionModel
      .find({ user_id: userId })
      .populate('movie_id');

    const genresDict = {} as Record<number, number>;

    userReactions.forEach((reaction) => {
      const movieGenres = reaction?.movie_id?.genre_ids;

      movieGenres.forEach((genre) => {
        genresDict[genre] = (genresDict[genre] ?? 0) + 1;
      });
    });

    const genreIds = Object.keys(genresDict)
      .sort((a, b) => genresDict[b] - genresDict[a])
      .slice(0, 5);

    return { genres: genresDict, genreIds };
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
