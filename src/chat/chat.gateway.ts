import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "src/chat/messages.service";
import { ChannelsService } from "./channels.service";
import { ChatService } from "./chat.service";
import CreateChannelDto from "./dto/createChannel.dto";
import CreateMessageDto from "./dto/createMessage.dto";
import Channel from "./entities/channel.entity";

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
    this.requestAllChannels(socket);
  }

  @SubscribeMessage('request_all_channels')
  async requestAllChannels(@ConnectedSocket() socket: Socket) {
    await this.chatService.getUserFromSocket(socket);
    const channels = await this.channelsService.getAllChannels();
    this.server.sockets.emit('get_all_channels', channels);
  }
  @SubscribeMessage('request_channel')
  async requestChannel(@MessageBody() channelData: Channel, @ConnectedSocket() socket: Socket) {
    console.log(channelData);
    const user = await this.chatService.getUserFromSocket(socket);
    const channel = await this.channelsService.getChannelByUser(channelData, user);
    this.server.sockets.emit('get_channel', channel);
  }

  @SubscribeMessage('create_channel')
  async createChannel(@MessageBody() channelData: CreateChannelDto, @ConnectedSocket() socket: Socket) {
    const owner = await this.chatService.getUserFromSocket(socket);
    const channel = await this.channelsService.createChannel(channelData, owner);
    this.server.sockets.emit('channel_created', channel);
  }

  @SubscribeMessage('delete_channel')
  async deleteChannel(@MessageBody() channel: Channel, @ConnectedSocket() socket: Socket) {
    console.log(channel);
    const user = await this.chatService.getUserFromSocket(socket);
    console.log(user);
    await this.channelsService.deleteChannel(channel, user);
    console.log('success');
    this.server.sockets.emit('channel_deleted', 'ok');
  }

  @SubscribeMessage('send_message')
  async listenForMessages(@MessageBody() messageData: CreateMessageDto, @ConnectedSocket() socket: Socket) {
    const author = await this.chatService.getUserFromSocket(socket);
    const message = await this.messagesService.saveMessage(messageData, author);
    this.server.sockets.emit('receive_message', message);
  }
}