import RequestWithUser from "src/authentication/request-with-user.interface";
import { UsersService } from "src/users/users.service";
import CreateChannelDto from "../dto/createChannel.dto";
import { FindOneParams } from "../dto/findOneParams.dto";
import UpdateChannelDto from "../dto/updateChannel.dto";
import { ChannelsService } from "../services/channels.service";
import { ChatService } from "../services/chat.service";
export declare class ChannelsController {
    private readonly chatsService;
    private readonly channelsService;
    private readonly usersService;
    constructor(chatsService: ChatService, channelsService: ChannelsService, usersService: UsersService);
    createChannel(request: RequestWithUser, channelData: CreateChannelDto): Promise<import("../entities/channel.entity").default>;
    getAllChannels(request: RequestWithUser): Promise<{
        user_channels: import("../entities/channel.entity").default[];
        avalaible_channels: import("../entities/channel.entity").default[];
        invited_channels: import("../entities/channel.entity").default[];
    }>;
    getChannel(request: RequestWithUser, channelData: FindOneParams): Promise<import("../entities/channel.entity").default>;
    updateChannel(request: RequestWithUser, channelData: UpdateChannelDto): Promise<import("../entities/channel.entity").default>;
    deleteChannel(request: RequestWithUser, channelData: FindOneParams): Promise<void>;
}
