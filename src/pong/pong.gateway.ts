import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { AuthenticationService } from "src/authentication/authentication.service";
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
    private readonly authenticationService: AuthenticationService
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
    const user = await this.authenticationService.getUserFromSocket(socket);
    socket.data.user = user;
    for (let game of this.games) {
      if (game.player1.user.id == user.id && game.player1.isReady == false) {
        game.player1.id = socket.id;
        game.player1.user = user;
        game.player1.isReady = true;
        socket.join(game.id);
      }        
      else if (game.player2.user.id == user.id && game.player2.isReady == false) {
        game.player2.id = socket.id;
        game.player2.user = user;
        game.player2.isReady = true;
        socket.join(game.id);
      }
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    if (this.waiting && this.waiting.id == socket.id)
      this.waiting = null;
    for (let game of this.games) {
      if (game.player1.id == socket.id)
        game.player1.isReady = false;
      else if (game.player2.id == socket.id)
        game.player2.isReady = false;
    }
  }
  
  @SubscribeMessage("joinQueue")
  async joinQueue(@ConnectedSocket() socket: Socket) {
    if (this.waiting.data.user.id == socket.data.id)
      return ;
    if (this.waiting == null) {
      this.waiting = socket;
      return 'waiting';
    }
    const gameId = (this.games.length > 0 ? (this.games[this.games.length - 1].id + 1) : 0).toString();
    let game = this.gamesService.initGame(gameId, this.waiting, socket);
    this.games.push(game);
    socket.join(gameId);
    this.waiting.join(gameId);
    this.server.to(game.id).emit("setupGame", game);
    this.waiting = null;
  }

  @SubscribeMessage("setupGame") 
  async setupGame(@ConnectedSocket() socket: Socket, @MessageBody() gameData: GameInterface) {
    let game = this.games.find(g => g.id == gameData.id);
    this.gamesService.setupGame(game, gameData);
    if (gameData.player1.isReady == true && gameData.player2.isReady == true) {
      this.gamesService.launchGame(game);
      this.server.to(gameData.id).emit('startGame', game);
    }
    else
      this.server.to(gameData.id).emit('setupGame', game);
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