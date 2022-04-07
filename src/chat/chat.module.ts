import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthenticationModule } from "src/authentication/authentication.module";
import { MessagesService } from "src/chat/messages.service";
import { ChannelsService } from "./channels.service";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import Channel from "./entities/channel.entity";
import Message from "./entities/message.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([Message]), 
    AuthenticationModule
  ],
  controllers: [],
  providers: [ChatGateway, ChatService, ChannelsService, MessagesService],
})
export class ChatModule {};