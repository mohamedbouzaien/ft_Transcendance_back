import { Repository } from "typeorm";
import CreateChannelDto from "../dto/createChannel.dto";
import Channel from "../entities/channel.entity";
import UpdateChannelDto from "../dto/updateChannel.dto";
import { ChannelUsersService } from "./channelUser.service";
export declare class ChannelsService {
    private readonly channelUsersService;
    private readonly channelsRepository;
    constructor(channelUsersService: ChannelUsersService, channelsRepository: Repository<Channel>);
    createChannel(channelData: CreateChannelDto): Promise<Channel>;
    getChannelById(id: number): Promise<Channel>;
    checkChannelPassword(plain_password: string, hashed_password: string): Promise<boolean>;
    getAllChannels(): Promise<Channel[]>;
    getAllDirectMessagesChannels(): Promise<Channel[]>;
    getAllPublicChannels(): Promise<Channel[]>;
    saveChannel(channel: Channel): Promise<Channel>;
    updateChannel(id: number, channelData: UpdateChannelDto): Promise<Channel>;
    deleteChannel(id: number): Promise<void>;
}
