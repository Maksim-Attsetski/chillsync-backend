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
import { FriendService } from './friends.service';
import { CreateFriendDto } from './dto/create-friends.dto';
import { Errors, type IQuery } from 'src/utils';
import { AuthGuard } from 'src/guards';
import { ParsedToken, ParsedTokenPipe } from 'src/decorators/TokenDecorator';
import { type ITokenDto } from '../users';

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
