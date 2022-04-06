import { Module } from "@nestjs/common";
import { AuthenticationModule } from "src/authentication/authentication.module";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
  imports: [AuthenticationModule],
  controllers: [],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {};