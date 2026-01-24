import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParsedToken, ParsedTokenPipe } from 'src/decorators/TokenDecorator';
import { AuthGuard, IsAdminGuard } from 'src/guards';
import { Errors, type IQuery } from 'src/utils';

import { type ITokenDto } from '../users';
import { CreateUserSubDto } from './dto/create.dto';
import { UpdateUserSubDto as UpdateSubsDto } from './dto/update.dto';
import { UserSubsService } from './user-subs.service';

@UseGuards(AuthGuard)
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

  @Get('/user')
  findByUser(@ParsedToken(ParsedTokenPipe) user: ITokenDto) {
    if (!user?._id) return Errors.unauthorized();
    console.log(user?._id);

    return this.subsService.findByUser(user?._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subsService.findOne(id);
  }

  // @UseGuards(IsAdminGuard)
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
