import User from "src/users/user.entity";
import Channel from "./channel.entity";
export declare enum UserPunishment {
    MUTE = "mute",
    BAN = "ban",
    NONE = ""
}
declare class ChannelPunishedUser {
    id: number;
    punishment: UserPunishment;
    end_of_sanction: Date;
    channel: Channel;
    user: User;
}
export default ChannelPunishedUser;
