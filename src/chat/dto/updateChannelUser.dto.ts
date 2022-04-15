import { IsNotEmpty, IsOptional } from "class-validator";
import User from "src/users/user.entity";
import Channel from "../entities/channel.entity";
import { ChannelUserRole } from "../entities/channelUser.entity";

class UpdateChannelUserDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  role: ChannelUserRole;
}

export default UpdateChannelUserDto;
