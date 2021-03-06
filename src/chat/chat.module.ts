import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthenticationModule } from "src/authentication/authentication.module";
import { MessagesService } from "src/chat/services/messages.service";
import { UsersModule } from "src/users/users.module";
import { ChannelsService } from "./services/channels.service";
import { ChannelUsersService } from "./services/channelUser.service";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./services/chat.service";
import Channel from "./entities/channel.entity";
import ChannelUser from "./entities/channelUser.entity";
import Message from "./entities/message.entity";
import { ChannelsController } from "./controllers/channels.controller";
import { ChatTasksService } from "./tasks/chatTasks.service";
import { DuelModule } from "src/duels/duel.module";
import { UserRelationshipsModule } from "src/user-relationships/user-relationships.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel]),
    TypeOrmModule.forFeature([Message]), 
    TypeOrmModule.forFeature([ChannelUser]),
    AuthenticationModule,
    UserRelationshipsModule,
    UsersModule,
    DuelModule
  ],
  controllers: [ChannelsController],
  providers: [ChatGateway, ChatService, ChannelsService, MessagesService, ChannelUsersService, ChatTasksService],
})
export class ChatModule {};