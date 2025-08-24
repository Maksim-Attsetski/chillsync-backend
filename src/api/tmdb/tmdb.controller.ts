import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';

import { type ITmdbParams, TmdbService } from './tmdb.service';
import { TGenreResponse, TMoviesResponse } from './types';
import { ParsedToken, ParsedTokenPipe } from 'src/decorators/TokenDecorator';
import { type ITokenDto } from '../users';
import { Errors } from 'src/utils';
import { IsAdminGuard } from 'src/guards';

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

  @UseGuards(IsAdminGuard)
  @Get('me')
  async getMoviesForMe(
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
    @Query() query: ITmdbParams,
  ) {
    if (!user?._id) throw Errors.unauthorized();

    const response = await this.tmdbService.getMoviesForMe(user._id, query);
    return response;
  }

  @Get('popular')
  async getPopularMovies(@Query() query: ITmdbParams) {
    const key = `popular:${JSON.stringify(query)}`;
    const cache = this.popularCache.get(key);
    if (cache && cache.expireAt > Date.now()) {
      return cache.data;
    }
    const response = await this.tmdbService.getPopularMovies(query);
    this.popularCache.set(key, {
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

  @Get('image')
  async getImage(
    @Query() query: { w: string; p: string },
    @Res() res: Response,
  ) {
    const { data, headers } = await this.tmdbService.getImage(query);

    // @ts-ignore
    res.setHeader('Content-Type', headers['content-type'] || 'image/jpeg');
    // @ts-ignore
    res.setHeader('Content-Length', data?.length?.toString?.());
    // @ts-ignore
    res.end(data); // важно: отправляем бинарный ответ и закрываем поток
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
