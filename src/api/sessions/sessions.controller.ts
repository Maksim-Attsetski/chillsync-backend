import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';

import { SessionsService } from './sessions.service';
import type { IQuery } from 'src/utils';
import { CreateSessionDto } from './dto/create.dto';
import { UpdateSessionDto } from './dto/update.dto';

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

  @Post()
  async create(@Body() dto: CreateSessionDto) {
    return await this.sessionsService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return await this.sessionsService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Query() query: { isUser?: boolean }) {
    return await this.sessionsService.remove(id, query?.isUser);
  }
}
