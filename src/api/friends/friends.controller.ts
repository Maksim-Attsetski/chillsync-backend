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
import { AuthGuard } from 'src/guards';
import { Errors, type IQuery } from 'src/utils';

import { type ITokenDto } from '../users';
import { CreateFriendDto } from './dto/create-friends.dto';
import { FriendService } from './friends.service';

@Controller('friends')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createFriendDto: CreateFriendDto,
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
  ) {
    if (!user?._id) throw Errors.unauthorized();
    return this.friendService.sendRequest(createFriendDto, user._id);
  }

  @Get()
  findAll(@Query() query: IQuery) {
    return this.friendService.findAll(query);
  }

  @Get('for/:id')
  findFor(@Query() query: IQuery, @Param('id') id: string) {
    return this.friendService.findFor(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendService.findOne(id);
  }

  @Patch('remove/:id')
  removeFriend(
    @Param('id') id: string,
    @ParsedToken(ParsedTokenPipe) user: ITokenDto,
  ) {
    if (!user?._id) throw Errors.unauthorized();
    return this.friendService.removeFriend(id, user?._id);
  }

  @Patch('accept/:id')
  acceptRequest(@Param('id') id: string) {
    return this.friendService.acceptRequest(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query() query: { isUserId?: boolean }) {
    return this.friendService.remove(id, query?.isUserId);
  }
}
