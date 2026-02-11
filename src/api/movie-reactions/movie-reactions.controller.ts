import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParsedToken, ParsedTokenPipe } from 'src/decorators/TokenDecorator';
import { AuthGuard } from 'src/guards';
import { Errors, type IQuery } from 'src/utils';

import { CreateMovieDto } from '../movies';
import { type ITokenDto } from '../users';
import { UpdateMovieReactionDto } from './dto/update-movie.dto';
import { MovieReactionService } from './movie-reactions.service';

@UseGuards(AuthGuard)
@Controller('movie-reactions')
export class MovieReactionController {
  constructor(private readonly movieReactionService: MovieReactionService) {}

  @Get()
  findAll(@Query() query: IQuery) {
    return this.movieReactionService.findAll(query);
  }

  @Get('random/:user_id')
  getRandomMovie(
    @Param('user_id') user_id?: string,
    @ParsedToken(ParsedTokenPipe) user?: ITokenDto,
  ) {
    if (!user?._id) throw Errors.unauthorized();
    if (!user_id) throw Errors.notFound('Friend');
    if (user?._id === user_id) throw Errors.badRequest('Одинаковые айди');

    return this.movieReactionService.getRandomMovie(user?._id, user_id);
  }

  @Get('suggest-evening')
  suggestEvening(@ParsedToken(ParsedTokenPipe) user: ITokenDto) {
    if (!user?._id) throw Errors.unauthorized();
    return this.movieReactionService.suggestEvening(user?._id);
  }

  @Get('for-me')
  findMoviesForMe(
    @Query() query: IQuery,
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
  ) {
    if (!user?._id) throw Errors.unauthorized();
    return this.movieReactionService.findMoviesForMe(query, user._id);
  }

  @Get('for-us')
  findMoviesForUserList(@Query() query: { userIds: string; genres: string }) {
    if (!query?.userIds || query?.userIds?.length === 0) return [];
    return this.movieReactionService.findMoviesForUserList(
      query?.userIds?.split(',') ?? [],
      query?.genres ?? '',
    );
  }

  @Get('friends')
  findFriendsReactions(@ParsedToken(ParsedTokenPipe) user: ITokenDto) {
    if (!user?._id) throw Errors.unauthorized();
    return this.movieReactionService.findFriendsReactions(
      { dependencies: ['movie_id'] },
      user?._id,
    );
  }

  @Get('find-by-movie/:id')
  getByMovie(
    @Param('id') id: string,
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
  ) {
    if (!user?._id) throw Errors.unauthorized();
    return this.movieReactionService.findByMovie(id, user?._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movieReactionService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Post('many')
  async createMany(
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
    @Body() createMovieDto: { list: CreateMovieDto[] },
  ) {
    return this.movieReactionService.createMany(createMovieDto.list, user?._id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMovieReactionDto) {
    return this.movieReactionService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query() user: { is_user: boolean }) {
    return this.movieReactionService.remove(id, !!user?.is_user);
  }
}
