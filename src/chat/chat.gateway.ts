import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "src/chat/messages.service";
import { ChannelsService } from "./channels.service";
import { ChatService } from "./chat.service";
import CreateChannelDto from "./dto/createChannel.dto";

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService, 
    private readonly channelsService: ChannelsService,
    private readonly messagesService: MessagesService) {
  }

  async handleConnection(socket: Socket) {
    this.requestAllMessages(socket);
  }

  @SubscribeMessage('create_channel')
  async createChannel(@MessageBody() channelData: CreateChannelDto, @ConnectedSocket() socket: Socket) {
    console.log(channelData);
    const owner = await this.chatService.getUserFromSocket(socket);
    const channel = await this.channelsService.createChannel(channelData, owner);
    console.log(channel);
    this.server.sockets.emit('channel_created', channel);
  }

  @SubscribeMessage('send_message')
  async listenForMessages(@MessageBody() content: string, @ConnectedSocket() socket: Socket) {
    const author = await this.chatService.getUserFromSocket(socket);
    const message = await this.messagesService.saveMessage(content, author);
    console.log(message);
    this.server.sockets.emit('receive_message', message);
  }

  @SubscribeMessage('request_all_messages')
  async requestAllMessages(@ConnectedSocket() socket: Socket) {
    await this.chatService.getUserFromSocket(socket);
    const messages = await this.messagesService.getAllMessages();
    this.server.sockets.emit('send_all_messages', messages);
  }
}