import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "src/chat/messages.service";
import { ChannelsService } from "./channels.service";
import { ChatService } from "./chat.service";
import CreateChannelDto from "./dto/createChannel.dto";
import CreateMessageDto from "./dto/createMessage.dto";
import UpdateChannelDto from "./dto/updateChannel.dto";
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
    const user = await this.chatService.getUserFromSocket(socket);
    const avalaible_channels = await this.channelsService.getAllChannelsForUser(user);
    const invited_channels = user.invited_channels;
    const user_channels = user.channels;
    const channels = {
      user_channels,
      avalaible_channels,
      invited_channels
    }
    socket.emit('get_all_channels', channels);
  }

  @SubscribeMessage('request_channel')
  async requestChannel(@MessageBody() channelData: Channel, @ConnectedSocket() socket: Socket) {
    const user = await this.chatService.getUserFromSocket(socket);
    const channel = await this.channelsService.getChannelByUser(channelData, user);
    socket.emit('get_channel', channel);
  }

  @SubscribeMessage('create_channel')
  async createChannel(@MessageBody() channelData: CreateChannelDto, @ConnectedSocket() socket: Socket) {
    const owner = await this.chatService.getUserFromSocket(socket);
    const channel = await this.channelsService.createChannel(channelData, owner);
    this.server.sockets.emit('channel_created', channel);
  }

  @SubscribeMessage('update_channel')
  async updateChannel(@MessageBody() channelData: UpdateChannelDto, @ConnectedSocket() socket: Socket) {
    try {
    const user = await this.chatService.getUserFromSocket(socket);
    const updated_channel = await this.channelsService.updateChannel(channelData.id, channelData, user);
    socket.emit('get_channel', updated_channel);
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  }

  @SubscribeMessage('delete_channel')
  async deleteChannel(@MessageBody() channel: Channel, @ConnectedSocket() socket: Socket) {
    const user = await this.chatService.getUserFromSocket(socket);
    await this.channelsService.deleteChannel(channel, user);
    this.server.sockets.emit('channel_deleted', 'ok');
  }

  @SubscribeMessage('join_channel')
  async joinChannel(@MessageBody() channel: Channel, @ConnectedSocket() socket: Socket) {
    try {
      const user = await this.chatService.getUserFromSocket(socket);
      const joined_channel = await this.channelsService.addUserToChannel(channel, user);
      socket.emit('channel_joined', joined_channel);
    }
    catch (error) {
      console.log(error);
      socket.emit(error.message, channel);
    }
  }

  @SubscribeMessage('send_message')
  async listenForMessages(@MessageBody() messageData: CreateMessageDto, @ConnectedSocket() socket: Socket) {
    const author = await this.chatService.getUserFromSocket(socket);
    const message = await this.messagesService.saveMessage(messageData, author);
    const channel = await this.channelsService.getChannelById(message.channel.id);
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (socket of sockets) {
      const author = await this.chatService.getUserFromSocket(socket);
      if (this.channelsService.isUserChannelMember(channel, author)) {
        socket.emit('receive_message', message);
      }
    }
  }
}