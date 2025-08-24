import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MovieReactionService } from './movie-reactions.service';
import { UpdateMovieReactionDto } from './dto/update-movie.dto';
import { Errors, type IQuery } from 'src/utils';
import { ParsedToken, ParsedTokenPipe } from 'src/decorators/TokenDecorator';
import { type ITokenDto } from '../users';
import { AuthGuard } from 'src/guards';

@UseGuards(AuthGuard)
@Controller('movie-reactions')
export class MovieReactionController {
  constructor(private readonly movieReactionService: MovieReactionService) {}

  @Get()
  findAll(@Query() query: IQuery) {
    return this.movieReactionService.findAll(query);
  }

  @Get('friends')
  findFriendsReactions(@ParsedToken(ParsedTokenPipe) user: ITokenDto) {
    if (!user?._id) throw Errors.unauthorized();
    return this.movieReactionService.findFriendsReactions({}, user?._id);
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
  remove(@Param('id') id: string, @Query() user: { is_user: boolean }) {
    return this.movieReactionService.remove(id, !!user?.is_user);
  }
}
