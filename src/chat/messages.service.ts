import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthenticationService } from "src/authentication/authentication.service";
import User from "src/users/user.entity";
import { Repository } from "typeorm";
import Message from "./entities/message.entity";

@Injectable()
export class MessagesService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {
  }
  async saveMessage(content: string, author: User) {
    const newMessage = await this.messagesRepository.create({
      content,
      author
    })
    await this.messagesRepository.save(newMessage);
    return newMessage;
  }

  async getAllMessages() {
    return (this.messagesRepository.find({
      relations: ['author']
    }));
  }
}