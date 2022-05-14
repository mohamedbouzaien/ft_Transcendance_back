import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { UserUnauthorizedException } from "src/users/exception/userUnauthorized.exception";
import GameInterface from "../interfaces/game.interface";

@Injectable()
export class RoomsService {
  checkQueueEligibility(socket: Socket, queue: Socket[], games: GameInterface[]) {
    queue.forEach(queued => {
      if (queued.data.user.id == socket.data.user.id)
        throw new UserUnauthorizedException(socket.data.user.id);
    });
    games.forEach(game => {
      if (game.player1.user.id == socket.data.user.id || game.player2.user.id == socket.data.user.id)
        throw new UserUnauthorizedException(socket.data.user.id);
    })
  }
}