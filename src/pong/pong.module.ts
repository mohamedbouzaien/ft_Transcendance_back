import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthenticationModule } from "src/authentication/authentication.module";
import { DuelModule } from "src/duels/duel.module";
import { UsersModule } from "src/users/users.module";
import Game from "./entities/game.entity";
import { PongGateway } from "./pong.gateway";
import { GamesService } from "./services/game.service";
import { RoomsService } from "./services/room.service";
import { TasksService } from "./tasks/tasks.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Game]),
    AuthenticationModule,
    UsersModule,
    DuelModule
  ],
  providers: [PongGateway, TasksService, RoomsService, GamesService]
})
export class PongModule {};