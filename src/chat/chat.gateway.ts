import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "src/chat/messages.service";
import { UsersService } from "src/users/users.service";
import { ChannelsService } from "./channels.service";
import { ChatService } from "./chat.service";
import ChannelInvitation from "./dto/ChannelInvitation";
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
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
    ) {
  }

  async handleConnection(socket: Socket) {
    this.requestAllChannels(socket);
  }

  async sendChannel(channel: Channel, event: string) {
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (let socket of sockets) {
      const user = await this.chatService.getUserFromSocket(socket);
      if (channel.channelUsers.find(channelUser => channelUser.user.id === user.id)) {
        socket.emit(event, channel);
      }
    }
  }

  @SubscribeMessage('request_all_channels')
  async requestAllChannels(@ConnectedSocket() socket: Socket) {
    const user = await this.chatService.getUserFromSocket(socket);
    const avalaible_channels = await this.channelsService.getAllChannelsForUser(user);
    const user_channels = await this.channelsService.exctractAllChannelsForUser(user);
    const invited_channels = user.invited_channels;
    const channels = {
      user_channels,
      avalaible_channels,
      invited_channels
    }
    console.log(channels);
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
    console.log(channel);
    if (channel.status === 'public') {
      this.server.sockets.emit('channel_created', channel);
    }
    else {
      socket.emit('channel_created', channel);
    }
  }

  @SubscribeMessage('update_channel')
  async updateChannel(@MessageBody() channelData: UpdateChannelDto, @ConnectedSocket() socket: Socket) {
    try {
    const user = await this.chatService.getUserFromSocket(socket);
    const updated_channel = await this.channelsService.updateChannel(channelData.id, channelData, user);
    this.sendChannel(updated_channel, 'updated_channel');
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  }

  @SubscribeMessage('delete_channel')
  async deleteChannel(@MessageBody() channel: Channel, @ConnectedSocket() socket: Socket) {
    const user = await this.chatService.getUserFromSocket(socket);
    await this.channelsService.deleteChannel(channel, user);
    this.server.sockets.emit('channel_deleted', channel.id);
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

  @SubscribeMessage('channel_invitation')
  async manageChannelInvitation(@MessageBody() invitationData: ChannelInvitation, @ConnectedSocket() socket: Socket) {
    const user = await this.chatService.getUserFromSocket(socket);
    const invited_user = await this.usersService.getById(invitationData.invited_user.id);
    await this.channelsService.manageInvitation(invitationData.channel.id, invited_user, user);
    const invited_channels = await (await this.usersService.getById(invitationData.invited_user.id)).invited_channels;
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (socket of sockets) {
      const author = await this.chatService.getUserFromSocket(socket);
      if (invited_user.id === author.id) {
        socket.emit('invited_channels', invited_channels);
        return ;
      }
    }
  }

  @SubscribeMessage('send_message')
  async listenForMessages(@MessageBody() messageData: CreateMessageDto, @ConnectedSocket() socket: Socket) {
    const author = await this.chatService.getUserFromSocket(socket);
    const message = await this.messagesService.saveMessage(messageData, author);
    const channel = await this.channelsService.getChannelById(message.channel.id);
    this.sendChannel(channel, 'receive_message');
  }
}