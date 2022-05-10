import { IsNotEmpty } from "class-validator";
import User from "src/users/user.entity";
import Channel from "../entities/channel.entity";
import { ChannelUserRole } from "../entities/channelUser.entity";

class CreateChannelUserDto {
  channelId: number;
  user: User;
  role: ChannelUserRole
}

export default CreateChannelUserDto;