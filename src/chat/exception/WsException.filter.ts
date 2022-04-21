import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Catch(WsException, HttpException)
export class WsExceptionFilter {
  public catch(exception: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  public handleError(client: Socket, exception: HttpException | WsException) {
    if (exception instanceof HttpException) {
      console.log(exception);
      client.emit('error', exception);
      // handle http exception
    } else {
      console.log(exception);
      client.emit('error', exception);
      // handle websocket exception
    }
  }
}