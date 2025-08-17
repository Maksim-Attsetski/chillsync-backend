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
import { UserSubsService } from './user-subs.service';
import { CreateUserSubDto } from './dto/create.dto';
import { UpdateUserSubDto as UpdateSubsDto } from './dto/update.dto';
import { type IQuery } from 'src/utils';

import { IsAdminGuard } from 'src/guards';

@Controller('user-subscriptions')
export class UserSubsController {
  constructor(private readonly subsService: UserSubsService) {}

  // @UseGuards(IsAdminGuard)
  @Post()
  async create(@Body() createDto: CreateUserSubDto) {
    return this.subsService.create(createDto);
  }

  @Get()
  findAll(@Query() query: IQuery) {
    return this.subsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subsService.findOne(id);
  }

  @UseGuards(IsAdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSubsDto) {
    return this.subsService.update(id, updateDto);
  }

  @UseGuards(IsAdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subsService.remove(id);
  }
}
