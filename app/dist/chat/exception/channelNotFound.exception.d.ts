import { NotFoundException } from '@nestjs/common';
export declare class ChannelNotFoundException extends NotFoundException {
    constructor(channelId: number);
}
