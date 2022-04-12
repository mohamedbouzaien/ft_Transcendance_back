import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthenticationService } from "src/authentication/authentication.service";
import { UserUnauthorizedException } from "src/users/exception/userUnauthorized.exception";
import User from "src/users/user.entity";
import { Repository } from "typeorm";
import { ChannelsService } from "./channels.service";
import CreateMessageDto from "./dto/createMessage.dto";
import Message from "./entities/message.entity";

@Injectable()
export class MessagesService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly channelsService: ChannelsService
  ) {
  }
  async saveMessage(messageData: CreateMessageDto, author: User) {
    const message_channel = await this.channelsService.getChannelById(messageData.channel.id);
    if (await this.channelsService.isUserChannelMember(message_channel, author) === false) {
      throw new UserUnauthorizedException(author.id);
    }
    const newMessage = await this.messagesRepository.create({
      ...messageData,
      author
    })
    await this.messagesRepository.save(newMessage);
    return newMessage;
  }

  async getAllMessages() {
    return (this.messagesRepository.find({
      relations: ['author', 'channel']
    }));
  }

  async getMessageById(id: number) {
    return await this.messagesRepository.findOne(id, {relations: ['author', 'channel']});
  }
}