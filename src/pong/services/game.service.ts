import { Injectable } from "@nestjs/common";
import { ConnectedSocket } from "@nestjs/websockets";
import { Socket } from "socket.io";
import GameInterface, { GameBallSpeed, GameMaxPoints, GamePlayerHeight, GameStatus } from "../interfaces/game.interface";
import MouseMoveInterface from "../interfaces/mouseMove.interface";
import PlayerInterface from "../interfaces/player.interface";

@Injectable()
export class GamesService {
  PLAYER_WIDTH = 5;
  canvas =  {height: 480, width: 640}

  reset(game: GameInterface) {
    // Set ball and players to the center
    game.ball.x = this.canvas.width / 2;
    game.ball.y = this.canvas.height / 2;
    game.player1.y = this.canvas.height / 2 - game.playerHeight / 2;
    game.player2.y = this.canvas.height / 2 - game.playerHeight / 2;
  
    // Reset speed
    game.ball.speed.x = 2;
    game.ball.speed.y = Math.random() * 2;
  }

  changeDirection(game: GameInterface, playerPosition) {
    var impact = game.ball.y - playerPosition - game.playerHeight / 2;
    var ratio = 100 / (game.playerHeight / 2);
    game.ball.speed.y = Math.round(impact * ratio / 10);
  }

  collide(game: GameInterface, player: PlayerInterface) {
    // The player doesnt hit the ball
    if (game.ball.y < player.y || game.ball.y > player.y + game.playerHeight) {
      this.reset(game);
      // Update score
      if (player == game.player1) {
        game.player2.score++;
      } else {
        game.player1.score++;
      }
    } else {
      // Increase speed and change direction
      game.ball.speed.x *= -1.2;
      this.changeDirection(game, player.y);
    }
  }

  ballMove(game: GameInterface) {
    if(game.ball.y > this.canvas.height || game.ball.y < 0) {
      game.ball.speed.y *= -1;
    }
    game.ball.x += game.ball.speed.x;
    game.ball.y += game.ball.speed.y;
    if (game.ball.x > this.canvas.width - this.PLAYER_WIDTH) {
      this.collide(game, game.player2);
    } else if (game.ball.x < this.PLAYER_WIDTH) {
      this.collide(game, game.player1);
    }
  }

  updateGame(game: GameInterface) {
    this.ballMove(game);
    if (game.player1.score == game.maxPoints || game.player2.score == game.maxPoints) {
      game.status = GameStatus.ENDED;
    }
    return game;
  }

  mouseUpdate(game: GameInterface, playerId: string, data: MouseMoveInterface) {
    let player;
    if (game.player1.id == playerId)
      player = game.player1;
    else
      player = game.player2;
    var mouseLocation = data.clientY - data.canvasLocation.y;
    if (mouseLocation < game.playerHeight / 2) {
      player.y = 0;
    } else if (mouseLocation > this.canvas.height - game.playerHeight / 2) {
      player.y = this.canvas.height - game.playerHeight;
    } else {
      player.y = mouseLocation - game.playerHeight / 2;
    }
  }

  initGame(gameId: string, player1: Socket, player2: Socket) {
    let game : GameInterface = {
      id: gameId,
      status: GameStatus.STOPPED,
      maxPoints: GameMaxPoints.FIVE,
      ballSpeed: GameBallSpeed.MEDIUM,
      playerHeight: GamePlayerHeight.MEDIUM,
      playerWidth: 5,
      player1: {
        id: player1.id,
        user: player1.data.user,
        isReady: false
      },
      player2: {
        id: player2.id,
        user: player2.data.user,
        isReady: false
      }
    }
    return (game);
  }

  setupGame(game: GameInterface, gameData: GameInterface) {
    for (let param in gameData) {
      if (param == 'player1' && 'isReady' in gameData.player1)
        game.player1.isReady = gameData.player1.isReady;
      else if (param == 'player2' && 'isReady' in gameData.player2)
        game.player2.isReady = gameData.player2.isReady;
      else
        game[param] = gameData[param];
    }

  }

  launchGame(game: GameInterface) {
    game.player1.x = 0;
    game.player1.y = this.canvas.height / 2 - game.playerHeight / 2;
    game.player1.score = 0;
  
    game.player2.x = this.canvas.width - game.playerWidth;
    game.player2.y = this.canvas.height / 2 - game.playerHeight / 2;
    game.player2.score = 0;

    game.ball = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      r: 5,
      speed: {
        x: game.ballSpeed,
        y: game.ballSpeed
      }
    }
    game.status = GameStatus.RUNNING;
  }
}