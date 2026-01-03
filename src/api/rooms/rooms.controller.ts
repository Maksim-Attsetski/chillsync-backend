import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ParsedToken, ParsedTokenPipe } from 'src/decorators/TokenDecorator';
import { Errors } from 'src/utils';

import type { ITokenDto } from '../users';
import { RoomStoreService } from './rooms.service';

@Controller('rooms')
export class RoomStoreController {
  constructor(private readonly movieService: RoomStoreService) {}
  @Get()
  findAll(@ParsedToken(ParsedTokenPipe) user: ITokenDto) {
    if (!user) throw Errors.unauthorized();
    return this.movieService.findAll(user?._id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movieService.remove(id);
  }
}
