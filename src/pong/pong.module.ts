import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthenticationModule } from "src/authentication/authentication.module";
import { UsersModule } from "src/users/users.module";
import Game from "./entities/game.entity";
import { PongGateway } from "./pong.gateway";
import { GamesService } from "./services/games.service";
import { PongService } from "./services/pong.service";

@Module({
  imports: [
    AuthenticationModule,
    UsersModule,
    TypeOrmModule.forFeature([Game]),

  ],
  providers: [PongGateway, PongService, GamesService]
})
export class PongModule {};