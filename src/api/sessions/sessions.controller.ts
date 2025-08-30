import { Controller, Get, Param, Delete, Query } from '@nestjs/common';

import { SessionsService } from './sessions.service';
import { Errors, type IQuery } from 'src/utils';
import { ParsedToken, ParsedTokenPipe } from 'src/decorators/TokenDecorator';
import { type ITokenDto } from '../users';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async sessions(@Query() query: IQuery) {
    return await this.sessionsService.findAll(query);
  }

  @Get(':id')
  async session(@Param('id') id: string) {
    return await this.sessionsService.findOne(id);
  }

  @Delete()
  async delete(
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
    @Query() query: { all?: boolean },
  ) {
    if (!user) throw Errors.unauthorized();
    return await this.sessionsService.delete(
      { user_id: user?._id, user_agent: user?.user_agent },
      query?.all,
    );
  }
}
