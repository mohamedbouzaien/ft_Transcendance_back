import { NotFoundException } from '@nestjs/common';
export declare class ChannelUserNotFoundException extends NotFoundException {
    constructor(channelUserId: number);
}
