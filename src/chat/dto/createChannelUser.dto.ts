import User from "src/users/user.entity";
import { ChannelUserRole } from "../entities/channelUser.entity";

class CreateChannelUserDto {
  channelId: number;
  user: User;
  role: ChannelUserRole
}

export default CreateChannelUserDto;