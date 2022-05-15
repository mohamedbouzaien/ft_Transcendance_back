import { Socket } from "socket.io";
import BallInterface from "../interfaces/ball.interface";
import GameInterface from "../interfaces/game.interface";
import MouseMoveInterface from "../interfaces/mouseMove.interface";
import PlayerInterface from "../interfaces/player.interface";

export enum GameStatus {
  RUNNING = 'running',
  INITIALIZATION = 'initialization',
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

class Game {
  id: string;
  status: GameStatus;
  canvasHeight: number;
  canvasWidth: number;
  maxPoints: GameMaxPoints;
  ballSpeed: GameBallSpeed;
  playerHeight: GamePlayerHeight;
  playerWidth: number;
  player1: PlayerInterface;
  player2: PlayerInterface;
  ball: BallInterface

  constructor(id: string, player1: Socket, player2: Socket) {
    this.id = id;
    this.status =  GameStatus.INITIALIZATION;
    this.canvasHeight = 480;
    this.canvasWidth = 640;
    this.maxPoints = GameMaxPoints.FIVE;
    this.ballSpeed =  GameBallSpeed.MEDIUM;
    this.playerHeight = GamePlayerHeight.MEDIUM;
    this.playerWidth = 5;
    this.player1 = {
      id: player1.id,
      user: player1.data.user,
      isReady: false
    },
    this.player2 = {
      id: player2.id,
      user: player2.data.user,
      isReady: false
    }
  }

  setupGame(socket: Socket, gameData: GameInterface) {
    /*if ((gameData.player1 && gameData.player1.isReady != game.player1.isReady && game.player1.id != socket.id) || 
    (gameData.player2 && gameData.player2.isReady != game.player2.isReady && game.player2.id != socket.id))
      throw new UserUnauthorizedException(socket.data.user.id);*/
    for (let param in gameData) {
      if (param == 'player1' && 'isReady' in gameData.player1)
        this.player1.isReady = gameData.player1.isReady;
      else if (param == 'player2' && 'isReady' in gameData.player2)
        this.player2.isReady = gameData.player2.isReady;
      else
        this[param] = gameData[param];
    }
  }

  launchGame() {
    this.player1.x = 0;
    this.player1.y = this.canvasHeight / 2 - this.playerHeight / 2;
    this.player1.score = 0;
  
    this.player2.x = this.canvasWidth - this.playerWidth;
    this.player2.y = this.canvasHeight / 2 - this.playerHeight / 2;
    this.player2.score = 0;

    this.ball = {
      x: this.canvasWidth / 2,
      y: this.canvasHeight / 2,
      r: 5,
      speed: {
        x: this.ballSpeed,
        y: this.ballSpeed
      }
    }
    this.status = GameStatus.RUNNING;
  }

  mouseUpdate(playerId: string, data: MouseMoveInterface) {
    let player;
    if (this.player1.id == playerId)
      player = this.player1;
    else
      player = this.player2;
    var mouseLocation = data.clientY - data.canvasLocation.y;
    if (mouseLocation < this.playerHeight / 2)
      player.y = 0;
    else if (mouseLocation > this.canvasHeight - this.playerHeight / 2)
      player.y = this.canvasHeight - this.playerHeight;
    else 
      player.y = mouseLocation - this.playerHeight / 2;
  }

  updateGame() {
    this.ballMove();
    if (this.player1.score == this.maxPoints || this.player2.score == this.maxPoints)
      this.status = GameStatus.ENDED;
  }

  ballMove() {
    if(this.ball.y > this.canvasHeight || this.ball.y < 0) {
      this.ball.speed.y *= -1;
    }
    this.ball.x += this.ball.speed.x;
    this.ball.y += this.ball.speed.y;
    if (this.ball.x > this.canvasWidth - this.playerWidth) {
      this.collide(this.player2);
    } else if (this.ball.x < this.playerWidth) {
      this.collide(this.player1);
    }
  }
 
  collide(player: PlayerInterface) {
    // The player doesnt hit the ball
    if (this.ball.y < player.y || this.ball.y > player.y + this.playerHeight) {
      this.reset();
      // Update score
      if (player == this.player1) {
        this.player2.score++;
      } else {
        this.player1.score++;
      }
    } else {
      // Increase speed and change direction
      this.ball.speed.x *= -1.2;
      this.changeDirection(player.y);
    }
  }

  reset() {
    // Set ball and players to the center
    this.ball.x = this.canvasWidth / 2;
    this.ball.y = this.canvasHeight / 2;
    this.player1.y = this.canvasHeight / 2 - this.playerHeight / 2;
    this.player2.y = this.canvasHeight / 2 - this.playerHeight / 2;
  
    // Reset speed
    this.ball.speed.x = 2;
    this.ball.speed.y = Math.random() * 2;
  }

  changeDirection(playerPosition) {
    var impact = this.ball.y - playerPosition - this.playerHeight / 2;
    var ratio = 100 / (this.playerHeight / 2);
    this.ball.speed.y = Math.round(impact * ratio / 10);
  }
}

export default Game;