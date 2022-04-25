import { Repository } from "typeorm";
import CreateChannelPunishedUserDto from "./dto/createChannelPunishementUser.dto";
import ChannelPunishedUser from "./entities/channelPunishedUser.entity";
export declare class ChannelPunishedUsersService {
    private readonly channelPunishedUsersRepository;
    constructor(channelPunishedUsersRepository: Repository<ChannelPunishedUser>);
    getChannelPunishedUserById(id: number): Promise<ChannelPunishedUser>;
    createChannelPunishedUser(punishedData: CreateChannelPunishedUserDto): Promise<ChannelPunishedUser>;
}
