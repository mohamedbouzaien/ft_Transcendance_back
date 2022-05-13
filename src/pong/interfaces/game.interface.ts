import BallInterface from "./ball.interface";
import PlayerInterface from "./player.interface";

export enum GameStatus {
  RUNNING = 'running',
  STOPPED = 'stopped',
  ENDED = 'ended'
};

export enum GameMaxPoints {
  FIVE = 5,
  TEN = 10,
  FIFTEEN = 15,
}

export enum GamePlayerHeight {
  SMALL = 50,
  MEDIUM = 100,
  LARGE = 150,
}

export enum GameBallSpeed {
  SLOW = 1.1,
  MEDIUM = 2,
  FAST = 2.5
}

class GameInterface {
  id: string;
  status: GameStatus;
  maxPoints: GameMaxPoints;
  ballSpeed: GameBallSpeed;
  playerHeight: GamePlayerHeight;
  playerWidth: number;
  player1: PlayerInterface;
  player2: PlayerInterface;
  ball?: BallInterface
}

export default GameInterface;