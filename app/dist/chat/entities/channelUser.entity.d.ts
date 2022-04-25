import User from "src/users/user.entity";
import Channel from "./channel.entity";
export declare enum ChannelUserRole {
    OWNER = 3,
    ADMIN = 2,
    USER = 1
}
export declare enum SanctionType {
    MUTE = "mute",
    BAN = "ban",
    NONE = ""
}
declare class ChannelUser {
    id: number;
    role: ChannelUserRole;
    sanction: SanctionType;
    end_of_sanction: Date;
    channel: Channel;
    user: User;
}
export default ChannelUser;
