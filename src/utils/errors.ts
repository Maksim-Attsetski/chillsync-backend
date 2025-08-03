import { HttpException, HttpStatus } from '@nestjs/common';
import { Error } from 'mongoose';

class Errors {
  notFound(model: string = 'Item ') {
    return new HttpException(model + ' was not found', HttpStatus.NOT_FOUND);
  }
  badRequest(message: string = 'Something went wrong') {
    return new HttpException(message, HttpStatus.BAD_REQUEST);
  }
  unauthorized() {
    return new HttpException('You are not authorized', HttpStatus.UNAUTHORIZED);
  }
  undefinedError(cause?: Error) {
    return new HttpException(
      'Unknown error',
      HttpStatus.INTERNAL_SERVER_ERROR,
      { cause },
    );
  }
  dublicate(cause?: Error, keys: Array<string> = []) {
    return new HttpException(
      `Уникальные поля ${
        keys.length > 0 ? '(' + keys.join() + ') ' : ''
      }не должны дублироваться!`,
      HttpStatus.BAD_REQUEST,
      { cause },
    );
  }
}

export default new Errors();
