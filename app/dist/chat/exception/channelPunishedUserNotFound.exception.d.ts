import { NotFoundException } from '@nestjs/common';
export declare class ChannelPunishedUserNotFoundException extends NotFoundException {
    constructor(channelPunishedUser: number);
}
