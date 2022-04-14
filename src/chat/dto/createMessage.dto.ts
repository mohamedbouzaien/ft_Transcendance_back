import User from "src/users/user.entity";
import Channel from "../entities/channel.entity";

class CreateMessageDto {
  author: User;
  channel: Channel;
  content: string;
}

export default CreateMessageDto;