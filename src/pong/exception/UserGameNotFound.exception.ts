import { NotFoundException } from '@nestjs/common';

export class UserGameNotFound extends NotFoundException {
  constructor() {
    super(`User game not found`);
  }
}