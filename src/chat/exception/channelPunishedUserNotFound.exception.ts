import { NotFoundException } from '@nestjs/common';

export class ChannelPunishedUserNotFoundException extends NotFoundException {
  constructor(channelPunishedUser: number) {
    super(`ChannelPunishedUser with id ${channelPunishedUser} not found`);
  }
}