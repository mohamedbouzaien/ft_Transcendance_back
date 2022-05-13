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

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log(socket.id);
    if (this.waiting && this.waiting.id == socket.id) {
      this.waiting = null;
    }
		console.log("disconnected");
  }
  
  @SubscribeMessage("joinQueue")
  async joinQueue(@ConnectedSocket() socket: Socket) {
    if (this.waiting == null) {
      this.waiting = socket;
      return ;
    }
    const gameId = (this.games.length > 0 ? (this.games[this.games.length].id + 1) : 0).toString();
    let game = this.gamesService.createGame(gameId, this.waiting.id, socket.id);
    this.games.push(game);
    socket.join(gameId);
    this.waiting.join(gameId);
    this.server.to(game.id).emit("startGame", game);
  }
  @SubscribeMessage("start")
  async start(@ConnectedSocket() socket: Socket, @MessageBody() data: PlayerInterface) {
    console.log('start');
  }

  @SubscribeMessage('mousemove')
  async mouseMove(@ConnectedSocket() socket: Socket, @MessageBody() data: MouseMoveInterface) {
    let game = this.games.find(g => g.id == data.id);
    this.gamesService.mouseUpdate(game, socket.id, data);
  }
}