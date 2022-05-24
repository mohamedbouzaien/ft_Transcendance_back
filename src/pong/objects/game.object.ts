import { Socket } from "socket.io";
import { UserUnauthorizedException } from "src/users/exception/userUnauthorized.exception";
import BallInterface from "../interfaces/ball.interface";
import GameSetupInterface from "../dto/gameSetup.dto";
import MouseMoveInterface from "../dto/mouseMove.dto";
import PlayerInterface from "../interfaces/player.interface";
import User from "src/users/user.entity";

export enum GameStatus {
  WAITING = 'waiting',
  INITIALIZATION = 'initialization',
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
  MEDIUM = 1.5,
  FAST = 2
}

class GameObject {
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

  constructor(id: string, player1: User, player2: User) {
    this.id = id;
    this.status =  GameStatus.INITIALIZATION;
    this.canvasHeight = 480;
    this.canvasWidth = 640;
    this.maxPoints = GameMaxPoints.FIVE;
    this.ballSpeed =  GameBallSpeed.MEDIUM;
    this.playerHeight = GamePlayerHeight.MEDIUM;
    this.playerWidth = 5;
    this.player1 = {
      user: player1,
      isReady: false
    },
    this.player2 = {
      user: player2,
      isReady: false
    }
  }

  setupGame(id: number, gameData: GameSetupInterface) {
    for (let param in gameData) {
      if (param == 'isPlayerReady') {
        let player = (this.player1.user.id == id )? this.player1 : this.player2;
        player.isReady = gameData[param];
      }
      else if (param.toString() == "maxPoints" || param == "ballSpeed" || param == "playerHeight") {
        this.player1.isReady = false;
        this.player2.isReady = false;
        this[param] = gameData[param];
      }
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
        x: 2,
        y: 0
      }
    }
    this.status = GameStatus.RUNNING;
  }

  mouseUpdate(playerId: number, data: MouseMoveInterface) {
    let player;
    if (this.player1.user.id == playerId)
      player = this.player1;
    else if (this.player2.user.id == playerId)
      player = this.player2;
    else 
      throw new UserUnauthorizedException(playerId);
    var mouseLocation = data.clientY - data.canvasLocationY;
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
        this.ball.speed.x *= -1;
        this.changeDirection(player.y);

        // Increase speed if it has not reached max speed
        if (Math.abs(this.ball.speed.x) < 12)
          this.ball.speed.x *= this.ballSpeed;
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

export default GameObject;