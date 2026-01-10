import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Errors, IQuery, MongoUtils } from 'src/utils';
import { IArrayRes } from 'src/utils/mongoUtils';

import { Friend, FriendDocument } from '../friends';
import {
  CreateMovieDto,
  GetMovieDto,
  Movie,
  MovieDocument,
  MovieService,
} from '../movies';
import { CreateMovieReactionDto } from './dto/create-movie-reaction.dto';
import { GetMovieReactionDto } from './dto/get-movie.dto';
import { UpdateMovieReactionDto } from './dto/update-movie.dto';
import { MovieReaction, MovieReactionDocument } from './movie-reactions.entity';

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

  async findMoviesForUserList(
    userIds: string[],
    genres: string,
  ): Promise<IArrayRes<MovieDocument>> {
    if (userIds.length === 0 || genres.length === 0)
      return { count: 0, data: [], last: true };
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

    return await MongoUtils.getAll<Model<MovieDocument>, MovieDocument>({
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

    const alreadyLikedMovies = userReactions.map((r) => r.movie_id?.id);
    const genreIds = Object.keys(genresDict)
      .sort((a, b) => genresDict[b] - genresDict[a])
      .slice(0, 4);

    const movies = await MongoUtils.getAll({
      model: this.movieModel,
      dto: GetMovieDto,
      query: {
        filter: `vote_count>=50;genre_ids_in_${genreIds.join(',')};id_not_in_${alreadyLikedMovies.join(',')}`,
        limit: 50,
      },
    });

    console.log('genre ids', genreIds);
    return movies;
  }

  async stats(user_id: string) {
    const userReactions = await this.movieReactionModel.find({ user_id });

    const likes = userReactions.filter((r) => r.reaction === 'LIKE');
    const watched = userReactions.filter(
      (r) => r.viewed_at && r.viewed_at !== 0 && r.viewed_at < Date.now(),
    );
    const watch_later = userReactions.filter(
      (r) =>
        !r.viewed_at ||
        (r.viewed_at && r.viewed_at === 0) ||
        r.viewed_at > Date.now(),
    );
    const reviews = userReactions.filter((r) => r.rating > 0);

    return {
      likes: likes?.length,
      dislikes: userReactions?.length - likes.length,
      reviews: reviews?.length,
      watched: watched?.length,
      watch_later: watch_later?.length,
    };
  }
  async findByMovie(movie_id: string, user_id: string) {
    const movie = await this.movieModel.findOne({ id: Number(movie_id) });
    if (!movie) throw Errors.notFound('Movie');

    const userReaction = await this.movieReactionModel.findOne({
      user_id,
      movie_id: movie?._id,
    });
    if (!userReaction) throw Errors.notFound('Reaction');
    return userReaction;
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
