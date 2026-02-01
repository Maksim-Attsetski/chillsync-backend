import { Inject, Injectable } from '@nestjs/common';
import { MovieReaction, MovieReactionDocument } from '../movie-reactions';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FriendService } from '../friends';
import { Errors } from 'src/utils';

@Injectable()
export class StatsService {
  constructor(
    @Inject()
    private friendsService: FriendService,
    @InjectModel(MovieReaction.name)
    private movieReactionModel: Model<MovieReactionDocument>,
  ) {}

  private async profileData(userReactions: MovieReaction[]) {
    const now = Date.now();

    let likes = 0;
    let dislikes = 0;
    let watched = 0;
    let watch_later = 0;
    let reviews = 0;

    for (let i = 0, len = userReactions.length; i < len; i++) {
      const r = userReactions[i];

      // лайки / дизлайки
      if (r.reaction === 'LIKE') {
        likes++;
      } else {
        dislikes++;
      }

      // отзывы
      if (r.rating > 0) {
        reviews++;
      }

      // просмотренные / отложенные
      if (r.viewed_at) {
        const time = r.viewed_at.getTime();

        if (time < now) {
          watched++;
        } else if (time > now || time === 0) {
          watch_later++;
        }
      }
    }

    return {
      likes,
      dislikes,
      reviews,
      watched,
      watch_later,
    };
  }

  async profile(user_id?: string) {
    if (!user_id) {
      const userReactions = await this.movieReactionModel.find();
      return this.profileData(userReactions);
    }

    const userReactions = await this.movieReactionModel.find({ user_id });
    return this.profileData(userReactions);
  }

  async genres(user_id?: string) {
    const match: any = { reaction: 'LIKE' };
    if (user_id) {
      match.user_id = new mongoose.Types.ObjectId(user_id);
    }

    const data = await this.movieReactionModel.aggregate<{
      _id: number;
      count: number;
    }>([
      { $match: match },
      {
        $lookup: {
          from: 'movies', // имя коллекции Movie
          localField: 'movie_id',
          foreignField: '_id',
          as: 'movie',
        },
      },

      { $unwind: '$movie' },
      { $unwind: '$movie.genre_ids' },

      {
        $group: {
          _id: '$movie.genre_ids',
          count: { $sum: 1 },
        },
      },
    ]);

    const result: Record<number, number> = Object.create(null);
    for (const { _id, count } of data) {
      result[_id] = count;
    }

    return result;
  }

  async friends(user_id?: string) {
    if (!user_id) return Errors.unauthorized();
    const data = await this.friendsService.findFor(user_id);

    return {
      friends: data?.friends?.length ?? 0,
      subs: data?.subs?.length ?? 0,
      followers: data?.followers?.length ?? 0,
    };
  }
}
