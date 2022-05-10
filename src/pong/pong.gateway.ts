import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import BallInterface from "./interfaces/ball.interface";
import PlayerInterface from "./interfaces/player.interface";

@WebSocketGateway({namespace: 'pong'})
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  connections: Socket[] = [];
  players: PlayerInterface[] = [];
  b: BallInterface;

  heartBeat() {
    this.server.emit('heartbeat', this.players);
  }

  heartbeatBall(){
    this.server.emit('heartbeatBall', this.b);
  }

  getCounter() {
    this.server.emit('getCounter', this.connections.length);
    console.log(this.connections.length);
  }
  
  async handleConnection(@ConnectedSocket() socket: Socket, ...args: any[]) {
    console.log('new user ' + socket.id);
    this.connections.push(socket);
    this.getCounter();
  }

  async handleDisconnect(socket: Socket) {
    this.connections.splice(this.connections.indexOf(socket),1);
		console.log("disconnected");
  }
  
  @SubscribeMessage("start")
  async start(@ConnectedSocket() socket: Socket, @MessageBody() data: PlayerInterface) {
    var player: PlayerInterface = {id: socket.id, ...data};
    this.players.push(player);
  }

  @SubscribeMessage("startBall")
  async startBall(@ConnectedSocket() socket: Socket, @MessageBody() data: BallInterface) {
		this.b = {id: socket.id, ...data};
  } 

  @SubscribeMessage("update")
  async update(@ConnectedSocket() socket: Socket, @MessageBody() data: PlayerInterface) {
		for(var i = 0; i < this.players.length; i++){
			if(socket.id === this.players[i].id)
        break;
		}
		this.players[i].x = data.x;
		this.players[i].y = data.y;
		this.players[i].v = data.v;
		this.players[i].w = data.w;
		this.players[i].h = data.h;
		this.players[i].points = data.points;
  }

  @SubscribeMessage("updateBall")
  async updateBall(@ConnectedSocket() socket: Socket, @MessageBody() data: BallInterface) {
		this.b.x = data.x;
		this.b.y = data.y;
		this.b.xv = data.xv;
		this.b.yv = data.yv;
		this.b.r = data.r;
  }
}