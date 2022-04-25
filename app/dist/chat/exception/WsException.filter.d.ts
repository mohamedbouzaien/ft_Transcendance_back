import { ArgumentsHost, HttpException } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
export declare class WsExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void;
    handleError(client: Socket, exception: HttpException | WsException): void;
}
