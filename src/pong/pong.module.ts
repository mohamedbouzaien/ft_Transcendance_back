import { Module } from "@nestjs/common";
import { AuthenticationModule } from "src/authentication/authentication.module";
import { UsersModule } from "src/users/users.module";
import { PongGateway } from "./pong.gateway";
import { PongService } from "./pong.service";

@Module({
  imports: [
    AuthenticationModule,
    UsersModule
  ],
  providers: [PongGateway, PongService]
})
export class PongModule {};