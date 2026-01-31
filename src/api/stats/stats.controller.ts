import { Controller, Get, UseGuards } from '@nestjs/common';
import { ParsedToken, ParsedTokenPipe } from 'src/decorators/TokenDecorator';
import { AuthGuard } from 'src/guards';

import { type ITokenDto } from '../users';
import { StatsService } from './stats.service';

@UseGuards(AuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly subsService: StatsService) {}

  @Get('/profile')
  profile(@ParsedToken(ParsedTokenPipe) user: ITokenDto) {
    return this.subsService.profile(user?._id);
  }

  @Get('/genres')
  genres(@ParsedToken(ParsedTokenPipe) user: ITokenDto) {
    return this.subsService.genres(user?._id);
  }

  @Get('/friends')
  friends(@ParsedToken(ParsedTokenPipe) user: ITokenDto) {
    return this.subsService.friends(user?._id);
  }
}
