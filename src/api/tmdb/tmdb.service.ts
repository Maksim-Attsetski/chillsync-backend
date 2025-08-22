import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IMovie, TGenreResponse, TMoviesResponse } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { Movie, MovieDocument } from '../movies';
import { Model } from 'mongoose';
import { MovieReactionDocument } from '../movie-reactions';

export interface ITmdbParams {
  include_adult?: boolean;
  language?: string;
  page?: number;
}

@Injectable()
export class TmdbService {
  private api_key: string;
  private baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel('MovieReaction')
    private movieReactionModel: Model<MovieReactionDocument>,
  ) {
    this.api_key = `Bearer ${process.env.TMDB_KEY}`;
    this.baseUrl = 'https://api.themoviedb.org/3/';
  }

  async axios<T = any>(url: string, options?: any) {
    const response = await firstValueFrom(
      this.httpService.get(url, {
        ...(options ?? {}),
        headers: {
          Accept: 'application/json',
          Authorization: this.api_key,
        },
      }),
    );
    return response.data as T;
  }

  async getMoviesForMe(userId: string, query: ITmdbParams) {
    const response = await this.getPopularMovies(query);
    return response;
  }

  async getPopularMovies({
    include_adult = false,
    language = 'ru-RU',
    page = 1,
  }: ITmdbParams) {
    const url =
      this.baseUrl +
      `discover/movie?include_adult=${include_adult}&include_video=false&language=${language}&page=${page}&sort_by=popularity.desc&release_date.gte=2000-01-01&vote_average.gte=2.5&with_runtime.gte=60`;

    const response = await this.axios<TMoviesResponse>(url);
    return response;
  }

  async getMoviesByQuery(query: string) {
    const encodeUri = encodeURIComponent(query);
    const url = `${this.baseUrl}search/movie?query=${encodeUri}&include_adult=false&language=ru-RU&page=1`;

    const response = await this.axios<TMoviesResponse>(url);
    return response;
  }

  async getGenres() {
    const url = `${this.baseUrl}genre/movie/list?language=ru`;

    const response = await this.axios<TGenreResponse>(url);
    return response;
  }

  async movieDetails(id: string) {
    const url = `${this.baseUrl}movie/${id}?language=ru-RU&page=1`;
    const videoUrl = `${this.baseUrl}movie/${id}/videos?language=`;
    const [res, videoRes, enVideoRes] = await Promise.all([
      this.axios<IMovie>(url),
      this.axios<{ results: any[] }>(videoUrl + 'ru-RU'),
      this.axios<{ results: any[] }>(videoUrl + 'en-US'),
    ]);

    return {
      ...res,
      videos: [
        ...(videoRes?.results ?? []),
        ...(enVideoRes?.results ?? []),
      ].filter((v) => v.type === 'Trailer'),
    };
  }

  async getRecommendations(id: string) {
    const url = `${this.baseUrl}movie/${id}/recommendations?language=ru-RU&page=1`;

    const response = await this.axios<TMoviesResponse>(url);
    return response;
  }

  async getImage({
    p,
    w,
  }: {
    w: string;
    p: string;
  }): Promise<{ data: any; headers: any }> {
    const imageUrl = `https://image.tmdb.org/t/p/w${w}${p.startsWith('/') ? p : '/' + p}`;

    const { data, headers } = await firstValueFrom(
      this.httpService.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: {},
      }),
    );
    return { data, headers };
  }
}
