import User from "src/users/user.entity";
import Channel from "../entities/channel.entity";
import { ChannelUserRole } from "../entities/channelUser.entity";
declare class CreateChannelUserDto {
    channel: Channel;
    user: User;
    role: ChannelUserRole;
}
export default CreateChannelUserDto;
