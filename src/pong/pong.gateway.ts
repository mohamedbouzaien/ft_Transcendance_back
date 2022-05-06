import { ConnectedSocket, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { AuthenticationService } from "src/authentication/authentication.service";
import User from "src/users/user.entity";
import { UsersService } from "src/users/users.service";
import { PongService } from "./pong.service";

@WebSocketGateway({namespace: 'pong'})
export class PongGateway {

  @WebSocketServer()
  server: Server;

  waiting: Socket = null;

  constructor(
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService,
    private readonly pongService: PongService
    ) {
  }

  @SubscribeMessage('findMatch')
  async matchmaking(@ConnectedSocket() socket: Socket) {
    console.log(socket);
    const user = await this.authenticationService.getUserFromSocket(socket);
    if (this.waiting == null) {
      this.waiting = socket;
    }
    else {
      console.log('here');
      const waitingUser = await this.authenticationService.getUserFromSocket(this.waiting);
      let room_id;
      if (waitingUser.id < user.id) {
        room_id = waitingUser.id.toString() + user.id.toString();  
      }
      else {
        room_id = user.id.toString() + waitingUser.id.toString();
      }
      this.waiting.join(room_id);
      socket.join(room_id);
      this.server.to(room_id).emit('joinedRoom', room_id);
    }
    return ('wait');
  }
}