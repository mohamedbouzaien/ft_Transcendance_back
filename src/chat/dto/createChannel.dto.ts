import { IsNotEmpty, IsOptional } from "class-validator";
import User from "src/users/user.entity";
import { ChannelStatus } from "../entities/channel.entity";
import Message from "../entities/message.entity";

class CreateChannelDto {
  @IsNotEmpty()
  status: ChannelStatus;

  @IsOptional()
  password: string;

  @IsOptional()
  members: User[];

  @IsOptional()
  invited_members: User[];
  
  @IsOptional()
  messages: Message[];
}

export default CreateChannelDto;