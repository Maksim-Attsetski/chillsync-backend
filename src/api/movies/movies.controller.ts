import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ParsedToken, ParsedTokenPipe } from 'src/decorators/TokenDecorator';
import { type IQuery } from 'src/utils';

import type { ITokenDto } from '../users';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieService } from './movies.service';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}
  @Get()
  findAll(
    @Query() query: IQuery,
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
  ) {
    return this.movieService.findAll(query);
  }

  @Get('by-titles')
  findByTitles(@Query('titles') titles: string) {
    return this.movieService.findMoviesByTitles(titles);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movieService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNewsDto: UpdateMovieDto) {
    return this.movieService.update(id, updateNewsDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movieService.remove(id);
  }
}
