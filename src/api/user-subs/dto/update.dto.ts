import { PartialType } from '@nestjs/mapped-types';
import { CreateUserSubDto } from './create.dto';

export class UpdateUserSubDto extends PartialType(CreateUserSubDto) {}
