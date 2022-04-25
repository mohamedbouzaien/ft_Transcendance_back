import { BadRequestException } from '@nestjs/common';

export class PasswordErrorException extends  BadRequestException {
  constructor(error: string) {
    super(error);
  }
}