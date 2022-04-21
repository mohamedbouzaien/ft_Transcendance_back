import { IsNotEmpty, IsNumber } from "class-validator";
import User from "src/users/user.entity";
import Channel from "../entities/channel.entity";

class CreateMessageDto {

  @IsNumber()
  @IsNotEmpty()
  channelId: number;

  @IsNotEmpty()
  content: string;
}

export default CreateMessageDto;