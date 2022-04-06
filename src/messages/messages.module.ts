import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthenticationModule } from "src/authentication/authentication.module";
import Message from "./message.entity";
import { MessagesService } from "./messages.service";

@Module({
  imports: [TypeOrmModule.forFeature([Message]),
    AuthenticationModule],
  controllers: [],
  providers:[MessagesService],
  exports: [MessagesService]
})
export class MessagesModule {};