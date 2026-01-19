import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { type IQuery } from 'src/utils';
import errors from 'src/utils/errors';

import { CreateSettingDto } from './dto/create.dto';
import { UpdateSettingDto } from './dto/update.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  async create(@Body() createDto: CreateSettingDto) {
    try {
      return this.settingsService.create(createDto);
    } catch (error) {
      throw errors.badRequest(error?.message);
    }
  }

  @Get()
  findAll(@Query() query: IQuery) {
    return this.settingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSettingDto) {
    return this.settingsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }
}
