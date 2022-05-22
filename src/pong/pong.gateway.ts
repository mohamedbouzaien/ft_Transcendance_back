import { BadRequestException, ClassSerializerInterceptor, Req, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { AuthenticationService } from "src/authentication/authentication.service";
import { UserUnauthorizedException } from "src/users/exception/userUnauthorized.exception";
import { FindOne } from "./dto/findOne.dto";
import { GameNotFoundException } from "./exception/GameNotFound.exception";
import GameSetupInterface from "./dto/gameSetup.dto";
import MouseMoveInterface from "./dto/mouseMove.dto";
import GameObject, { GameStatus } from "./objects/game.object";
import { RoomsService } from "./services/room.service";
import { WsExceptionFilter } from "src/chat/exception/WsException.filter";
import { DuelsService } from "src/duels/services/duel.service";
import { GamesService } from "./services/game.service";
import { UsersService } from "src/users/users.service";
import { UserStatus } from "src/users/user-status.enum";
import User from "src/users/user.entity";
import { UserGameNotFound } from "./exception/UserGameNotFound.exception";
import { Interval } from "@nestjs/schedule";


@UseFilters(WsExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway(  
 {
  namespace:'pong',
  allowEIO3: true ,
  cors: {
    origin: process.env.FRONT_URL,
    methods: ["GET", "POST"],
    credentials: true
}})
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  queue: Socket[];
  games: GameObject[];
  
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly duelsService: DuelsService,
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
    private readonly gamesService: GamesService
  ) {
    this.queue = [];
    this.games = [];
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const user = await this.authenticationService.getUserFromSocket(socket);
    socket.data.user = await this.serializeBroadcastedUser(user);
    for (let game of this.games) {
      if (((game.player1.user.id == user.id && game.player1.isReady == false) ||
      (game.player2.user.id == user.id && game.player2.isReady == false)) && game.status != GameStatus.WAITING) {
        let player = (game.player1.user.id == user.id && game.player1.isReady == false)? game.player1 : game.player2;
        player.user = user;
        player.isReady = true;
        this.usersService.setStatus(UserStatus.PLAYING, player.user.id);
        if (game.player1.isReady == true && game.player2.isReady == true)
          game.status = GameStatus.RUNNING;
        socket.join(game.id);
        socket.emit('update', game);
      }
    }
    const duels = await this.duelsService.getAllUserDuels(user);
    socket.emit('duels-update', duels);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    let isQueued = this.queue.find(queued => queued.id == socket.id);
    if (isQueued)
      this.queue.splice(this.queue.indexOf(isQueued), 1);
    for (let game of this.games) {
      if (game.player1.user.id == socket.data.user.id || game.player2.user.id == socket.data.user.id) {
        let player = (game.player1.user.id == socket.data.user.id)? game.player1 : game.player2;
        await this.usersService.setStatus(UserStatus.ONLINE, player.user.id);
        if (game.status == GameStatus.WAITING) {
          this.games.splice(this.games.indexOf(game), 1);
        }
        if (game.status == GameStatus.INITIALIZATION) {
          this.server.to(game.id).emit('playerLeft', player.user);
          this.server.in(game.id).socketsLeave(game.id);
          this.games.splice(this.games.indexOf(game), 1);
        }
        else if (game.status == GameStatus.RUNNING || game.status == GameStatus.STOPPED) {
          player.isReady = false;
          let time = new Date();
          time.setSeconds(time.getSeconds() + 10);
          player.timer = time;
          game.status = GameStatus.STOPPED;
          this.server.to(game.id).emit('update', game);
        }
      }
    }
  }

  @Interval(1000 / 60)
  async heartBeat() {
    for (let game of this.games) {
      if (game.status == GameStatus.RUNNING) {
        game.updateGame();
        if (game.status.toString() == GameStatus.ENDED) {
          const newGame = await this.gamesService.createGame(game);
          this.usersService.saveUsersGameResult(newGame);
          this.server.to(game.id).emit('update', game);
          this.usersService.setStatus(UserStatus.ONLINE, game.player1.user.id);
          this.usersService.setStatus(UserStatus.ONLINE, game.player2.user.id);
          this.server.in(game.id).socketsLeave(game.id);
          this.games.splice(this.games.indexOf(game), 1);
        }
        else
         this.server.to(game.id).emit('update', game);
      }
    }
  }
  
  async checkDisconnection() {
    let time = new Date();
    for (let game of this.games) {
      if (game.status == GameStatus.STOPPED && (game.player1.isReady == false || game.player2.isReady == false) ) {
        let checkedPlayer = (game.player1.isReady == false)? game.player1 : game.player2;
        if (checkedPlayer.isReady == false && time > checkedPlayer.timer) {
          if (!(game.player1.isReady == false && game.player2.isReady == false)) {
            let winner =  (game.player1.isReady == false)? game.player2 : game.player1;
            winner.score = game.maxPoints;
            this.usersService.setStatus(UserStatus.ONLINE, winner.user.id);
          }
          game.status = GameStatus.ENDED;
          const newGame = await this.gamesService.createGame(game);
          this.usersService.saveUsersGameResult(newGame);
          this.server.to(game.id).emit('update', game);
          this.server.in(game.id).socketsLeave(game.id);
          this.games.splice(this.games.indexOf(game), 1);
        }
      }
    }
  }

  matchmaking() {
    while (this.queue.length >= 2) {
      const gameId = (this.games.length > 0 ? (this.games[this.games.length - 1].id + 1) : 0).toString();
      const player1 = this.queue.shift();
      const player2 = this.queue.shift();
      let game = new GameObject(gameId, player1.data.user, player2.data.user);
      player1.rooms.clear();
      player2.rooms.clear();
      player1.join(gameId);
      player2.join(gameId);
      this.games.push(game);
      this.server.to(game.id).emit("update", game);
    }
  }

  async serializeBroadcastedUser(user: User) {
    for (let key in user) {
      if (key != 'id' && key != 'username' && key != 'avatar_id'
      && key != 'status' && key != 'victories' && key != 'defeats') {
        delete user[key];
      }
    }
    return user;
  }

  @SubscribeMessage("joinQueue")
  async joinQueue(@ConnectedSocket() socket: Socket) {
    try {
      this.roomsService.isUserAlreadyPlaying(socket, this.queue, this.games);
      socket.rooms.clear();
      this.queue.push(socket);
      while (this.queue.length >= 2) {
        const gameId = (this.games.length > 0 ? (this.games[this.games.length - 1].id + 1) : 0).toString();
        const player1 = this.queue.shift();
        const player2 = this.queue.shift();
        let game = new GameObject(gameId, player1.data.user, player2.data.user);
        player1.rooms.clear();
        player2.rooms.clear();
        player1.join(gameId);
        player2.join(gameId);
        this.games.push(game);
        this.server.to(game.id).emit("update", game);
      }
      return this.queue.length;
    } catch (error) {
      return error;
    }
  }


  @UsePipes(new ValidationPipe())
  @SubscribeMessage("setupGame") 
  async setupGame(@ConnectedSocket() socket: Socket, @MessageBody() gameData: GameSetupInterface) {
    try {
      let game = this.games.find(g => g.id == gameData.id);
      if (!game)
        throw new GameNotFoundException(gameData.id);
      if (game.status != GameStatus.INITIALIZATION)
        throw new BadRequestException();
      game.setupGame(socket.data.user.id, gameData);
      if (game.player1.isReady == true && game.player2.isReady == true) {
        this.usersService.setStatus(UserStatus.PLAYING, game.player1.user.id);
        this.usersService.setStatus(UserStatus.PLAYING, game.player2.user.id);
        game.launchGame();
        this.server.to(gameData.id).emit('update', game);
        return ;
      }
      else
        this.server.to(gameData.id).emit('update', game);
    } catch (error) {
      return (error);
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('mousemove')
  async mouseMove(@ConnectedSocket() socket: Socket, @MessageBody() data: MouseMoveInterface) {
    try {
      let game = this.games.find(g => g.id == data.id);
      if (!game)
        throw new GameNotFoundException(data.id);
      game.mouseUpdate(socket.data.user.id, data);
      return 'success';
    } catch (error){
      return error;
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('viewGame')
  async addViewerToGame(@ConnectedSocket() socket: Socket, @MessageBody() data: FindOne) {
    try {
      this.roomsService.isUserAlreadyPlaying(socket, this.queue, this.games);
      socket.rooms.clear();
      for (let game of await this.games) {
        if (game.player1.user.id == Number(data.id) || game.player2.user.id == Number(data.id)) {
          socket.join(game.id);
          socket.to(game.id).emit('newViewer', socket.data.user);
          return 'success';
        }
      }
      throw new UserGameNotFound();
    } catch (error){
      return error;
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('joinWaitingRoom')
  async joinWaitingRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: FindOne) {
    try {
      this.roomsService.isUserAlreadyPlaying(socket, this.queue, this.games);
      const duel = await this.duelsService.getDuelById(Number(data.id));
      if (duel.sender.id != socket.data.user.id && duel.receiver.id != socket.data.user.id)
        throw new UserUnauthorizedException(socket.data.user.id);
      for (let game of this.games) {
        if (game.player1.user.id == duel.sender.id &&
          game.player2.user.id == duel.receiver.id && game.status == GameStatus.WAITING) {
            this.duelsService.deleteDuel(duel.id);
            game.status = GameStatus.INITIALIZATION;
            socket.rooms.clear();
            socket.join(game.id);
            this.server.to(game.id).emit('update', game);
            return ;
        }
      };
      const gameId = (this.games.length > 0 ? (this.games[this.games.length - 1].id + 1) : 0).toString();
      let game = new GameObject(gameId, duel.sender, duel.receiver);
      game.status = GameStatus.WAITING;
      socket.rooms.clear();
      socket.join(game.id);
      this.games.push(game);
      this.server.to(game.id).emit("update", game);
    } catch (error) {
      return (error);
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('leaveRoom')
  async leaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: FindOne) {
    try {
      const game = this.games.find(g => g.id == data.id);
      if (!game)
        throw new GameNotFoundException(data.id);
      socket.leave(game.id);
      this.server.to(game.id).emit('viewerLeft', socket.data.user);
      return ('success');
    } catch (error) {
      return error;
    }
  }
}