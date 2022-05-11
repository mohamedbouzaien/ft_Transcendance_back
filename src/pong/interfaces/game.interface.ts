import BallInterface from "./ball.interface";
import PlayerInterface from "./player.interface";

class GameInterface {
  id: string;
  players?: PlayerInterface[];
  ball?: BallInterface
}

export default GameInterface;