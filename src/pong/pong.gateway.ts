import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { AuthenticationService } from "src/authentication/authentication.service";
import GameInterface, { GameStatus } from "./interfaces/game.interface";
import MouseMoveInterface from "./interfaces/mouseMove.interface";
import PlayerInterface from "./interfaces/player.interface";
import { GamesService } from "./services/game.service";
import { RoomsService } from "./services/room.service";


@WebSocketGateway({namespace: 'pong'})
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  queue: Socket[];
  games: GameInterface[];


  constructor(
    private readonly gamesService: GamesService,
    private readonly authenticationService: AuthenticationService,
    private readonly roomsService: RoomsService
  ) {
    this.queue = [];
    this.games = [];
  }

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
  
  async matchmaking() {
    while (this.queue.length >= 2) {
      const gameId = (this.games.length > 0 ? (this.games[this.games.length - 1].id + 1) : 0).toString();
      const player1 = this.queue.shift();
      const player2 = this.queue.shift();
      let game = this.gamesService.initGame(gameId, player1, player2);
      player1.join(gameId);
      player2.join(gameId);
      this.games.push(game);
      this.server.to(game.id).emit("setupGame", game);
    }
  }

  async checkPlayerSurrender() {
    let time = new Date();
    for (let game of this.games) {
      if (game.status == GameStatus.STOPPED && (game.player1.isReady == false || game.player2.isReady == false) ) {
        let checkedPlayer = (game.player1.isReady == false)? game.player1 : game.player2;
        if (checkedPlayer.isReady == false && time > checkedPlayer.timer) {
          let winner =  (game.player1.isReady == false)? game.player2 : game.player1;
          winner.score = game.maxPoints;
          game.status = GameStatus.ENDED;
          this.server.to(game.id).emit('endGame', game);
        }
      }
    }
  }

  async handleConnection(@ConnectedSocket() socket: Socket, ...args: any[]) {
    const user = await this.authenticationService.getUserFromSocket(socket);
    socket.data.user = user;
    for (let game of this.games) {
      if ((game.player1.user.id == user.id && game.player1.isReady == false) ||
      (game.player2.user.id == user.id && game.player2.isReady == false)) {
        let player = (game.player1.user.id == user.id && game.player1.isReady == false)? game.player1 : game.player2;
        player.id = socket.id;
        player.user = user;
        player.isReady = true;
        game.status = GameStatus.RUNNING;
        socket.join(game.id);
      }
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    /*if (this.waiting && this.waiting.id == socket.id)
      this.waiting = null;*/
    for (let game of this.games) {
      if (game.player1.id == socket.id || game.player2.id == socket.id) {
        let player = (game.player1.id == socket.id)? game.player1 : game.player2;
        player.isReady = false;
        let time = new Date();
        time.setSeconds(time.getSeconds() + 10);
        player.timer = time;
        game.status = GameStatus.STOPPED;
      }
    }
  }
  


  @SubscribeMessage("joinQueue")
  async joinQueue(@ConnectedSocket() socket: Socket) {
    try {
      //this.roomsService.checkQueueEligibility(socket, this.queue, this.games);
      this.queue.push(socket);
      return this.queue.length;
    } catch (error) {
      console.log(error);
      return error;
    }
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

  @SubscribeMessage('mousemove')
  async mouseMove(@ConnectedSocket() socket: Socket, @MessageBody() data: MouseMoveInterface) {
    let game = this.games.find(g => g.id == data.id);
    this.gamesService.mouseUpdate(game, socket.id, data);
  }
}