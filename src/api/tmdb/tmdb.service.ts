import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IMovie, TGenreResponse, TMoviesResponse } from './types';

@Injectable()
export class TmdbService {
  private api_key: string;
  private baseUrl: string;

  constructor(private readonly httpService: HttpService) {
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

  async getPopularMovies() {
    const url =
      this.baseUrl +
      'discover/movie?include_adult=false&include_video=false&language=ru-RU&page=1&sort_by=popularity.desc&release_date.gte=2000-01-01&vote_average.gte=2.5&with_runtime.gte=60';

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
    const videoUrl = `${this.baseUrl}movie/${id}/videos?language=ru-RU`;
    const [res, videoRes] = await Promise.all([
      this.axios<IMovie>(url),
      this.axios<{ results: any[] }>(videoUrl),
    ]);

    return { ...res, videos: videoRes?.results ?? [] };
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
