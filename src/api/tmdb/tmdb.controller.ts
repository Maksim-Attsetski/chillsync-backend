import { Controller, Get, Param, Query } from '@nestjs/common';

import { TmdbService } from './tmdb.service';
import { TGenreResponse, TMoviesResponse } from './types';

interface ICache<T> {
  expireAt: number;
  data: T;
}

@Controller('tmdb')
export class TmdbController {
  popularCache: Map<string, ICache<TMoviesResponse>>;
  genresCache: Map<string, ICache<TGenreResponse>>;

  constructor(private readonly tmdbService: TmdbService) {
    this.popularCache = new Map();
    this.genresCache = new Map();
  }

  @Get('popular')
  async getPopularMovies() {
    const cache = this.popularCache.get('popular');
    if (cache && cache.expireAt > Date.now()) {
      return cache.data;
    }
    const response = await this.tmdbService.getPopularMovies();
    this.popularCache.set('popular', {
      expireAt: Date.now() + 360_000 * 24,
      data: response,
    });
    return response;
  }

  @Get('genres')
  async getGenres() {
    const cache = this.genresCache.get('genres');
    if (cache && cache.expireAt > Date.now()) {
      return cache.data;
    }
    const response = await this.tmdbService.getGenres();
    this.genresCache.set('genres', {
      expireAt: Date.now() + 360_000 * 24 * 7,
      data: response,
    });
    return response;
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.tmdbService.getMoviesByQuery(q);
  }

  @Get(':id')
  movieDetails(@Param('id') id: string) {
    return this.tmdbService.movieDetails(id);
  }

  @Get(':id/recommendations')
  recommendations(@Param('id') id: string) {
    return this.tmdbService.getRecommendations(id);
  }
}
