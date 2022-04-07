import User from "src/users/user.entity";
import { ChannelStatus } from "../entities/channel.entity";

class CreateChannelDto {
  status: ChannelStatus;
  password: string;
  members: User[];
}

export default CreateChannelDto;