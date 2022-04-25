import User from "src/users/user.entity";
import ChannelUser from "./channelUser.entity";
import Message from "./message.entity";
export declare enum ChannelStatus {
    PRIVATE = "private",
    PUBLIC = "public",
    DIRECT_MESSAGE = "direct_message"
}
declare class Channel {
    id: number;
    name: string;
    status: ChannelStatus;
    password: string;
    channelUsers: ChannelUser[];
    invited_members: User[];
    messages: Message[];
}
export default Channel;
