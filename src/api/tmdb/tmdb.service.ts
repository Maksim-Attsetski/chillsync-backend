import { HttpService } from '@nestjs/axios';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IMovie, TGenreResponse, TMoviesResponse } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { CreateMovieDto, Movie, MovieDocument, MovieService } from '../movies';
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
    @Inject(forwardRef(() => MovieService))
    private movieService: MovieService,
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

  async fetchMoviesByYear(
    year: number,
    { include_adult, language }: ITmdbParams,
  ): Promise<IMovie[]> {
    let page = 1;
    let results: IMovie[] = [];
    let totalPages = 1;

    while (page <= totalPages) {
      const url =
        this.baseUrl +
        `discover/movie?include_adult=${include_adult}&include_video=false&language=${language}&page=${page}&release_date.gte=${year}-01-01&release_date.lte=${year}-12-31&sort_by=popularity.desc&vote_average.gte=3.2&with_runtime.gte=82`;

      const data = await this.axios<TMoviesResponse>(url);

      await this.movieService.createManyMovies(
        data.results.map(
          (m) =>
            ({
              adult: m.adult,
              genre_ids: m.genre_ids,
              id: m.id,
              overview: m.overview,
              poster_path: m.poster_path,
              reaction: 'LIKE',
              title: m.title,
              vote_average: m.vote_average,
              vote_count: m.vote_count,
              release_date: m.release_date,
            }) as CreateMovieDto,
        ),
      );

      results = [...results, ...data.results];
      totalPages = data.total_pages;
      page++;

      // пауза между запросами (чтобы не превысить лимит TMDB)
      await new Promise((resolve) => setTimeout(resolve, 350));
    }

    return results;
  }

  async fetchMoviesUntilYear(
    endYear: number,
    q: ITmdbParams,
  ): Promise<IMovie[]> {
    let allMovies: IMovie[] = [];
    const startYear: number = endYear;
    // const startYear: number = endYear - 1;

    for (let year = startYear; year <= endYear; year++) {
      console.log(`📅 Загружаем фильмы за ${year}`);
      const movies = await this.fetchMoviesByYear(year, q);

      allMovies = [...allMovies, ...movies];

      // дополнительная пауза между годами
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('====================================');
    console.log(
      'films',
      allMovies.map((m) => `${m.title} ${m.release_date}`),
    );
    console.log('====================================');

    return allMovies;
  }

  async getMoviesForMe(userId: string, query: ITmdbParams) {
    const res = await this.fetchMoviesUntilYear(2025, query);

    // console.log('====================================');
    // console.log(res);
    // console.log('====================================');

    // .findOneAndUpdate(
    //   { title: createMovieDto.title },
    //   { $set: { ...createMovieDto } },
    //   { upsert: true, new: true },
    // );

    return res;
  }

  async getPopularMovies({
    include_adult = false,
    language = 'ru-RU',
    page = 1,
  }: ITmdbParams) {
    const url =
      this.baseUrl +
      // `discover/movie?include_adult=${include_adult}&include_video=false&language=${language}&page=${page}&sort_by=popularity.desc&release_date.gte=2026-01-01&release_date.lte=2026-12-31&vote_average.gte=2.5&with_runtime.gte=60`;
      `discover/movie?include_adult=${include_adult}&include_video=false&language=${language}&page=${page}&release_date.gte=2025-01-01&release_date.lte=2025-12-31&sort_by=popularity.desc&vote_average.gte=3.2&with_runtime.gte=82`;

    const response = await this.axios<TMoviesResponse>(url);
    return response;
  }

  async getMoviesByQuery(query: string) {
    const encodeUri = encodeURIComponent(query);
    ``;
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
