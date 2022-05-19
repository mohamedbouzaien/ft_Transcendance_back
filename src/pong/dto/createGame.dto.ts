import User from "src/users/user.entity";
import { EndGameStatus } from "../entities/game.entity";
import { GameBallSpeed, GameMaxPoints, GamePlayerHeight } from "../objects/game.object";

class CreateGameDto {
  player1: User;
  player2: User;
  player1Points?: number;
  player2Points?: number;
  endGameStatus?: EndGameStatus;
  pointsTarget: GameMaxPoints;
  ballSpeed: GameBallSpeed;
  playersSize: GamePlayerHeight
}

export default CreateGameDto;