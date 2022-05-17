import { NotFoundException } from '@nestjs/common';

export class DuelNotFoundException extends NotFoundException {
  constructor(duelID: number) {
    super(`Channel with id ${duelID} not found`);
  }
}