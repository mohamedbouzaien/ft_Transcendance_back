import User from "src/users/user.entity";
import { ChannelStatus } from "../entities/channel.entity";
import Message from "../entities/message.entity";

class CreateChannelDto {
  status: ChannelStatus;
  password: string;
  members: User[];
  invited_members: User[];
  messages: Message[];
}

export default CreateChannelDto;