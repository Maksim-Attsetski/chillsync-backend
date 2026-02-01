import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from 'src/guards';

import { StatsService } from './stats.service';

@UseGuards(AuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly subsService: StatsService) {}

  @Get('/profile')
  profileByAll() {
    return this.subsService.profile();
  }

  @Get('/profile/:id')
  profile(@Param('id') id: string) {
    return this.subsService.profile(id);
  }

  @Get('/genres')
  genresByAll() {
    return this.subsService.genres();
  }

  @Get('/genres/:id')
  genres(@Param('id') id: string) {
    return this.subsService.genres(id);
  }

  @Get('/friends/:id')
  friends(@Param('id') id: string) {
    return this.subsService.friends(id);
  }
}
