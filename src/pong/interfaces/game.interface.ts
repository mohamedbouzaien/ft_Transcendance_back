import BallInterface from "./ball.interface";
import PlayerInterface from "./player.interface";

export enum GameStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
  ENDED = 'ended'
};

class GameInterface {
  id: string;
  max_points: number;
  status: GameStatus;
  player1: PlayerInterface;
  player2: PlayerInterface
  ball: BallInterface
}

export default GameInterface;