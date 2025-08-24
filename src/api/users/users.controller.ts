import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type IQuery } from 'src/utils';
import { AuthGuard, IsAdminGuard } from 'src/guards';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ERoles } from './dto/create-user.dto';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: IQuery) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('isFull') isFull: boolean) {
    return this.usersService.findOne(id, isFull);
  }

  @UseGuards(IsAdminGuard)
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() updateUserDto: { role: ERoles }) {
    return this.usersService.updateRole(id, updateUserDto);
  }

  @Patch(':id/password')
  updatePassword(
    @Param('id') id: string,
    @Body() updateUserDto: { last: string; new: string },
  ) {
    return this.usersService.updatePassword(id, updateUserDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
