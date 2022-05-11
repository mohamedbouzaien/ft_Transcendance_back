import BallInterface from "./ball.interface";
import PlayerInterface from "./player.interface";

class GameInterface {
  id: string;
  player?: PlayerInterface;
  computer?: PlayerInterface
  ball?: BallInterface
}

export default GameInterface;