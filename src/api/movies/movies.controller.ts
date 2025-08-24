import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MovieService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Errors, type IQuery } from 'src/utils';
import { ParsedToken, ParsedTokenPipe } from 'src/decorators/TokenDecorator';
import type { ITokenDto } from '../users';
import { AuthGuard } from 'src/guards';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  async create(
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
    @Body() createMovieDto: CreateMovieDto,
  ) {
    return this.movieService.create(createMovieDto, user._id);
  }

  @UseGuards(AuthGuard)
  @Post('many')
  async createMany(
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
    @Body() createMovieDto: { list: CreateMovieDto[] },
  ) {
    return this.movieService.createMany(createMovieDto.list, user?._id);
  }

  @Get()
  findAll(
    @Query() query: IQuery,
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
  ) {
    return this.movieService.findAll(query);
  }
  @Get('for-me')
  findMoviesForMe(
    @Query() query: IQuery,
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
  ) {
    if (!user?._id) throw Errors.unauthorized();
    return this.movieService.findMoviesForMe(query, user._id);
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
