import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FriendService } from './friends.service';
import { CreateFriendDto } from './dto/create-friends.dto';
import { UpdateFriendDto } from './dto/update-friends.dto';
import { type IQuery } from 'src/utils';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Post()
  async create(@Body() createFriendDto: CreateFriendDto) {
    return this.friendService.create(createFriendDto);
  }

  @Get()
  findAll(@Query() query: IQuery) {
    return this.friendService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFriendDto: UpdateFriendDto) {
    return this.friendService.update(id, updateFriendDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query() query: { isUserId?: boolean }) {
    return this.friendService.remove(id, query?.isUserId);
  }
}
