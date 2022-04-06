import { Module } from "@nestjs/common";
import { AuthenticationModule } from "src/authentication/authentication.module";
import { MessagesModule } from "src/messages/messages.module";
import { MessagesService } from "src/messages/messages.service";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
  imports: [AuthenticationModule, MessagesModule],
  controllers: [],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {};