import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendDto } from './create-friends.dto';

export class UpdateFriendDto extends PartialType(CreateFriendDto) {}
