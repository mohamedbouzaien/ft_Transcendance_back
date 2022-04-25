import User from "src/users/user.entity";
import Channel from "./channel.entity";
declare class Message {
    id: number;
    content: string;
    author: User;
    channel: Channel;
}
export default Message;
