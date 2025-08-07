import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MovieReactionService } from './movie-reactions.service';
import { UpdateMovieReactionDto } from './dto/update-movie.dto';
import { type IQuery } from 'src/utils';

@Controller('movie-reactions')
export class MovieReactionController {
  constructor(private readonly movieReactionService: MovieReactionService) {}

  @Get()
  findAll(@Query() query: IQuery) {
    return this.movieReactionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movieReactionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMovieReactionDto) {
    return this.movieReactionService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movieReactionService.remove(id);
  }
}
