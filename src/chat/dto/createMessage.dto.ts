import Channel from "../entities/channel.entity";

class CreateMessageDto {
  channel: Channel;
  content: string
}

export default CreateMessageDto;