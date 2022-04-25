import User from "src/users/user.entity";
import Channel from "../entities/channel.entity";
import { UserPunishment } from "../entities/channelPunishedUser.entity";
declare class CreateChannelPunishedUserDto {
    punishment: UserPunishment;
    end_of_sanction: Date;
    user: User;
    channel: Channel;
}
export default CreateChannelPunishedUserDto;
