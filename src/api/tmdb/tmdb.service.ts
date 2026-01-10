import { HttpService } from '@nestjs/axios';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { CreateMovieDto, MovieService } from '../movies';
import { IMovie, TGenreResponse, TMoviesResponse } from './types';

export interface ITmdbParams {
  include_adult?: boolean;
  minDur?: number;
  maxDur?: number;
  minRate?: number;
  language?: string;
  page?: number;
}

const year = new Date().getFullYear() + 2;

@Injectable()
export class TmdbService {
  private api_key: string;
  private api_key2: string;
  private baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => MovieService))
    private movieService: MovieService,
  ) {
    this.api_key = `Bearer ${process.env.TMDB_KEY}`;
    this.api_key2 = `Bearer ${process.env.TMDB_KEY_2}`;
    this.baseUrl = 'https://api.themoviedb.org/3/';
  }

  async axios<T = any>(url: string, isSecond: boolean = false, options?: any) {
    const response = await firstValueFrom(
      this.httpService.get(url, {
        ...(options ?? {}),
        headers: {
          Accept: 'application/json',
          Authorization: isSecond ? this.api_key2 : this.api_key,
        },
      }),
    );
    return response.data as T;
  }

  getUrl(
    { include_adult, language, page, minDur, maxDur, minRate }: ITmdbParams,
    year: number,
  ) {
    return (
      this.baseUrl +
      // `discover/movie?include_adult=${include_adult}&include_video=false&language=${language}&page=${page}&release_date.gte=${year}-01-01&release_date.lte=${year}-12-31&sort_by=popularity.desc&vote_average.gte=${minRate}&with_runtime.gte=${minDur}&with_runtime.lte=${maxDur}`
      `discover/movie?include_adult=${include_adult}&include_video=false&language=${language}&page=${page}&release_date.gte=${year}-01-01&sort_by=popularity.desc&with_runtime.gte=${minDur}&with_runtime.lte=${maxDur}`
    );
  }

  async fetchMoviesByYear(
    year: number,
    q: ITmdbParams,
    isSecondary: boolean,
  ): Promise<IMovie[]> {
    let page = 1;
    let results: IMovie[] = [];
    let totalPages = 1;

    while (page <= totalPages) {
      console.log(`📅 Загружаем фильмы, страница ${page} из ${totalPages}`);

      const data = await this.axios<TMoviesResponse>(
        this.getUrl({ ...q, page }, year),
        isSecondary,
      );

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

  async fetchMoviesUntilYear(endYear: number): Promise<void> {
    const startYear: number = 2000;
    // const startYear: number = endYear - 1;

    for (let year = endYear; year >= startYear; year--) {
      console.log(`📅 Загружаем фильмы за ${year}`);
      await Promise.allSettled([
        this.fetchMoviesByYear(
          year,
          {
            include_adult: false,
            language: 'ru-RU',
            maxDur: 90,
            minDur: 30,
            minRate: 3.4,
          },
          false,
        ),
        this.fetchMoviesByYear(
          year,
          {
            include_adult: false,
            language: 'ru-RU',
            maxDur: 200,
            minDur: 90,
            minRate: 3.4,
          },
          true,
        ),
      ]);

      // дополнительная пауза между годами
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  async getMoviesForMe(userId: string, query: ITmdbParams) {
    await this.fetchMoviesUntilYear(year);
    return 'Success';
  }

  async getPopularMovies({
    include_adult = false,
    language = 'ru-RU',
    page = 1,
    minDur = 20,
    maxDur,
    minRate = 3,
  }: ITmdbParams) {
    console.log('====================================');
    console.log(minDur);
    console.log('====================================');
    const url =
      this.baseUrl +
      `discover/movie?language=${language}&page=${page}&release_date.gte=2000-01-01&release_date.lte=2025-12-31&sort_by=popularity.desc&vote_average.lte=${minRate}&with_runtime.gte=${minDur}&with_runtime.lte=${maxDur}`;
    // `discover/movie?include_adult=${include_adult}&include_video=false&language=${language}&page=${page}&release_date.gte=2000-01-01&release_date.lte=2025-12-31&sort_by=popularity.desc&vote_average.gte=${minRate}&with_runtime.gte=${minDur}&with_runtime.lte=${maxDur}`;

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
