import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import BallInterface from "./interfaces/ball.interface";
import GameInterface from "./interfaces/game.interface";
import PlayerInterface from "./interfaces/player.interface";

@WebSocketGateway({namespace: 'pong'})
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  waiting: Socket = null;
  games: GameInterface[] = [];

  heartBeat() {
    this.games.forEach(g => {
      this.server.to(g.id.toString()).emit('heartbeat', g);
    })
  }
  
  async handleConnection(@ConnectedSocket() socket: Socket, ...args: any[]) {
    if (this.waiting == null) {
      this.waiting = socket;
      socket.emit('getCounter', 1);
    }
    else {
      this.waiting.join("1");
      socket.join("1");
      var game : GameInterface = {id: "1", players: []};
      this.games.push(game);
      this.waiting = null;
      this.server.to("1").emit('getCounter', 2);
    }
    console.log('new user ' + socket.id);
  }

  async handleDisconnect(socket: Socket) {
		console.log("disconnected");
  }
  
  @SubscribeMessage("start")
  async start(@ConnectedSocket() socket: Socket, @MessageBody() data: PlayerInterface) {
    const rooms = socket.rooms;
    if(rooms.size == 2) {
      const room = Array.from(rooms).pop()
      let game = this.games.find(g => g.id.toString() == room);
      game.players.push({id: socket.id, ...data})
    }
  }

  @SubscribeMessage("startBall")
  async startBall(@ConnectedSocket() socket: Socket, @MessageBody() data: BallInterface) {
    const rooms = socket.rooms;
    if(rooms.size == 2) {
      const room = Array.from(rooms).pop()
      let game = this.games.find(g => g.id.toString() == room);
      if (!game.ball)
        game.ball = {id: socket.id, ...data};
    }
  } 

  @SubscribeMessage("update")
  async update(@ConnectedSocket() socket: Socket, @MessageBody() data: GameInterface) {
    let game = this.games.find(g => g.id == data.id);
    let player = game.players.find(p => p.id == socket.id);
    player = data.players[0];
  }

  @SubscribeMessage("updateBall")
  async updateBall(@ConnectedSocket() socket: Socket, @MessageBody() data: GameInterface) {
    let game = this.games.find(g => g.id == data.id);
    game.ball = data.ball;
  }
}