import { NotFoundException } from '@nestjs/common';

export class ChannelUserNotFoundException extends NotFoundException {
  constructor(channelUserId: number) {
    super(`ChannelUser with id ${channelUserId} not found`);
  }
}