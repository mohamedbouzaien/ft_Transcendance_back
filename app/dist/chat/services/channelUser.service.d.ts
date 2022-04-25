import { Repository } from "typeorm";
import CreateChannelUserDto from "../dto/createChannelUser.dto";
import UpdateChannelUserDto from "../dto/updateChannelUser.dto";
import ChannelUser from "../entities/channelUser.entity";
export declare class ChannelUsersService {
    private readonly channelUsersRepository;
    constructor(channelUsersRepository: Repository<ChannelUser>);
    getChannelUserById(id: number): Promise<ChannelUser>;
    createChannelUser(channelUserData: CreateChannelUserDto): Promise<ChannelUser>;
    updateChannelUser(id: number, channelUserData: UpdateChannelUserDto): Promise<ChannelUser>;
    deleteChannelUser(id: number): Promise<void>;
}
