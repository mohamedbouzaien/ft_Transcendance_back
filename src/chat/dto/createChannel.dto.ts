import { IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from "class-validator";
import User from "src/users/user.entity";
import { ChannelStatus } from "../entities/channel.entity";
import Message from "../entities/message.entity";

class CreateChannelDto {
  @IsNotEmpty()
  status: ChannelStatus;

  @ValidateIf(o => Boolean(o.password))
  @MinLength(7)
  @IsString()
  password: string;
}

export default CreateChannelDto;