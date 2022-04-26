import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthenticationService } from "src/authentication/authentication.service";
import User from "src/users/user.entity";
import { Repository } from "typeorm";
import { ChannelsService } from "./channels.service";
import CreateMessageDto from "../dto/createMessage.dto";
import Message from "../entities/message.entity";
import Channel from "../entities/channel.entity";

@Injectable()
export class MessagesService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly channelsService: ChannelsService
  ) {
  }
  async saveMessage(messageData: CreateMessageDto, author: User, channel: Channel) {
    const newMessage = await this.messagesRepository.create({...messageData, author, channelId: channel.id});
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