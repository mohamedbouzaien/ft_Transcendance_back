import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import BallInterface from "./interfaces/ball.interface";
import GameInterface, { GameStatus } from "./interfaces/game.interface";
import MouseMoveInterface from "./interfaces/mouseMove.interface";
import PlayerInterface from "./interfaces/player.interface";
import { GamesService } from "./services/game.service";


@WebSocketGateway({namespace: 'pong'})
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  waiting: Socket = null;
  games: GameInterface[] = [];
  PLAYER_HEIGHT = 100;
  PLAYER_WIDTH = 5;
  canvas =  {height: 480, width: 640}

  constructor(
    private readonly gamesService: GamesService,
  ) {}

  heartBeat() {
    for (let game of this.games) {
      if (game.status == GameStatus.RUNNING) {
        this.gamesService.updateGame(game);
        if (game.status.toString() == GameStatus.ENDED) {
          this.server.to(game.id).emit('endGame', game);
          this.games.splice(this.games.indexOf(game), 1);
        }
        else
         this.server.to(game.id).emit('update', game);
      }
    }
  }
  
  async handleConnection(@ConnectedSocket() socket: Socket, ...args: any[]) {
    console.log('new user ' + socket.id);
  }

  async handleDisconnect(socket: Socket) {
		console.log("disconnected");
  }
  
  @SubscribeMessage("joinQueue")
  async joinQueue(@ConnectedSocket() socket: Socket) {
    if (this.waiting == null) {
      this.waiting = socket;
    }
    socket.join(this.games.length.toString());
    let game = {
      id: this.games.length.toString(),
      status: GameStatus.RUNNING,
      max_points: 1,
      player: {
        id: this.waiting.id,
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
    this.games.push(game);
    this.server.to(game.id).emit("startGame", game);
  }
  @SubscribeMessage("start")
  async start(@ConnectedSocket() socket: Socket, @MessageBody() data: PlayerInterface) {
    console.log('start');
  }

  @SubscribeMessage('mousemove')
  async mouseMove(@ConnectedSocket() socket: Socket, @MessageBody() data: MouseMoveInterface) {
    let game = this.games.find(g => g.id == data.id);
    this.gamesService.mouseUpdate(game, data);
  }
}