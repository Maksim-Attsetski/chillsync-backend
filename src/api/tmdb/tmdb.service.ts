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

  async axios<T = any>(url: string) {
    const response = await firstValueFrom(
      this.httpService.get(url, {
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

    const response = await this.axios<IMovie>(url);
    return response;
  }

  async getRecommendations(id: string) {
    const url = `${this.baseUrl}movie/${id}/recommendations?language=ru-RU&page=1`;

    const response = await this.axios<TMoviesResponse>(url);
    return response;
  }
}
