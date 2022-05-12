import BallInterface from "./ball.interface";
import PlayerInterface from "./player.interface";

export enum GameStatus {
  RUNNING = 'running',
  STOPPED = 'stopped'
};

class GameInterface {
  id: string;
  max_points: number;
  status: GameStatus;
  player?: PlayerInterface;
  computer?: PlayerInterface
  ball?: BallInterface
}

export default GameInterface;