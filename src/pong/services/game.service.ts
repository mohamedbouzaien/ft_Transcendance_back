import { Injectable } from "@nestjs/common";
import { ConnectedSocket } from "@nestjs/websockets";
import { Socket } from "dgram";
import { GameStatus } from "../interfaces/game.interface";
import MouseMoveInterface from "../interfaces/mouseMove.interface";

@Injectable()
export class GamesService {
  PLAYER_HEIGHT = 100;
  PLAYER_WIDTH = 5;
  canvas =  {height: 480, width: 640}

  reset(game) {
    // Set ball and players to the center
    game.ball.x = this.canvas.width / 2;
    game.ball.y = this.canvas.height / 2;
    game.player.y = this.canvas.height / 2 - this.PLAYER_HEIGHT / 2;
    game.computer.y = this.canvas.height / 2 - this.PLAYER_HEIGHT / 2;
  
    // Reset speed
    game.ball.speed.x = 3;
    game.ball.speed.y = Math.random() * 3;
  }

  changeDirection(game, playerPosition) {
    var impact = game.ball.y - playerPosition - this.PLAYER_HEIGHT / 2;
    var ratio = 100 / (this.PLAYER_HEIGHT / 2);
    game.ball.speed.y = Math.round(impact * ratio / 10);
  }

  collide(game, player) {
    // The player doesnt hit the ball
    if (game.ball.y < player.y || game.ball.y > player.y + this.PLAYER_HEIGHT) {
      this.reset(game);
      // Update score
      if (player == game.player) {
        game.computer.score++;
      } else {
        game.player.score++;
      }
    } else {
      // Increase speed and change direction
      game.ball.speed.x *= -1.2;
      this.changeDirection(game, player.y);
    }
  }

  ballMove(game) {
    if(game.ball.y > this.canvas.height || game.ball.y < 0) {
      game.ball.speed.y *= -1;
    }
    game.ball.x += game.ball.speed.x;
    game.ball.y += game.ball.speed.y;
    if (game.ball.x > this.canvas.width - this.PLAYER_WIDTH) {
      this.collide(game, game.computer);
    } else if (game.ball.x < this.PLAYER_WIDTH) {
      this.collide(game, game.player);
    }
  }

  computerMove(game) {
    game.computer.y += game.ball.speed.y * 0.85;
  }

  updateGame(game) {
    this.computerMove(game);
    this.ballMove(game);
    if (game.player.score == game.max_points || game.computer.score == game.max_points) {
      game.status = GameStatus.ENDED;
    }
    return game;
  }

  mouseUpdate(game, data: MouseMoveInterface) {
    var mouseLocation = data.clientY - data.canvasLocation.y;
    if (mouseLocation < this.PLAYER_HEIGHT / 2) {
      game.player.y = 0;
    } else if (mouseLocation > this.canvas.height - this.PLAYER_HEIGHT / 2) {
      game.player.y = this.canvas.height - this.PLAYER_HEIGHT;
    } else {
      game.player.y = mouseLocation - this.PLAYER_HEIGHT / 2;
    }
  }

  createGame(gameId: string, playerId: string, ) {
    let game = {
      id: gameId,
      status: GameStatus.RUNNING,
      max_points: 1,
      player: {
        id: playerId,
        x: 0,
        y: this.canvas.height / 2 - this.PLAYER_HEIGHT / 2,
        score: 0
      },
      computer: {
        id: "2",
        y: this.canvas.height / 2 - this.PLAYER_HEIGHT / 2,
        x: this.canvas.width - this.PLAYER_WIDTH,
        score: 0
      },
      ball: {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        r: 5,
        speed: {
          x: 1.1,
          y: 1.1
        }
      }
    };
    return game;
  }
}