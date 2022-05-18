import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthenticationModule } from "src/authentication/authentication.module";
import { DuelModule } from "src/duels/duel.module";
import { UsersModule } from "src/users/users.module";
import { PongGateway } from "./pong.gateway";
import { RoomsService } from "./services/room.service";
import { TasksService } from "./tasks/tasks.service";

@Module({
  imports: [
    AuthenticationModule,
    UsersModule,
    DuelModule
  ],
  providers: [PongGateway, TasksService, RoomsService]
})
export class PongModule {};