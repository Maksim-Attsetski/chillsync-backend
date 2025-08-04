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
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubDto as CreateSubsDto } from './dto/create-sub.dto';
import { UpdateSubDto as UpdateSubsDto } from './dto/update-sub.dto';
import { type IQuery } from 'src/utils';

import { IsAdminGuard } from 'src/guards';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subsService: SubscriptionsService) {}

  // @UseGuards(IsAdminGuard)
  @Post()
  async create(@Body() createDto: CreateSubsDto) {
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
