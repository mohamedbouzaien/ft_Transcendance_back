import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UsersService } from "src/users/users.service";
import { ChannelsService } from "./services/channels.service";
import { ChatService } from "./services/chat.service";
import { ChannelInvitationDto } from "./dto/ChannelInvitation.dto";
import CreateChannelDto from "./dto/createChannel.dto";
import CreateMessageDto from "./dto/createMessage.dto";
import UpdateChannelDto from "./dto/updateChannel.dto";
import UpdateChannelUserDto from "./dto/updateChannelUser.dto";
import { SanctionType } from "./entities/channelUser.entity";
import CreateDirectMessageDto from "./dto/createDirectMessage.dto";
import {UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { WsExceptionFilter } from "./exception/WsException.filter";
import { FindOneParams } from "./dto/findOneParams.dto";
import { ChannelStatus } from "./entities/channel.entity";

@UseFilters(WsExceptionFilter)
@WebSocketGateway(
  { cors: {
  origin: "http://localhost:3008",
  methods: ["GET", "POST"],
  credentials: true
}}
)
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatsService: ChatService, 
    private readonly channelsService: ChannelsService,
    private readonly usersService: UsersService,
    ) {
  }

  async handleConnection(socket: Socket) {
    this.requestAllChannels(socket);
  }

  async sendToUsers(channelId: number, event: string, to_send: any) {
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (let socket of sockets) {
      const user = await this.chatsService.getUserFromSocket(socket);
      if (user.userChannels.find(userChannel => userChannel.channel.id === channelId && userChannel.sanction !== SanctionType.BAN)) {
        socket.emit(event, to_send);
      }
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('request_all_channels')
  async requestAllChannels(@ConnectedSocket() socket: Socket) {
    const user = await this.chatsService.getUserFromSocket(socket);
    const channels = await this.chatsService.getAllChannelsForUser(user);
    socket.emit('get_all_channels', channels);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('request_channel')
  async requestChannel(@MessageBody() channelData: FindOneParams, @ConnectedSocket() socket: Socket) {
    console.log(channelData);
    const user = await this.chatsService.getUserFromSocket(socket);
    const channel = await this.chatsService.getChannelForUser(channelData, user);
    console.log(channel);
    socket.emit('get_channel', channel);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('create_channel')
  async createChannel(@MessageBody() channelData: CreateChannelDto, @ConnectedSocket() socket: Socket) {
    const owner = await this.chatsService.getUserFromSocket(socket);
    const channel = await this.chatsService.createChannel(channelData, owner);
    if (channel.status === ChannelStatus.PUBLIC) {
      this.server.sockets.emit('channel_created', channel);
    }
    else {
      socket.emit('channel_created', channel);
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('update_channel')
  async updateChannel(@MessageBody() channelData: UpdateChannelDto, @ConnectedSocket() socket: Socket) {
    const user = await this.chatsService.getUserFromSocket(socket);
    const updated_channel = await this.chatsService.updateChannel(channelData, user);
    this.sendToUsers(updated_channel.id, 'updated_channel', updated_channel);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('delete_channel')
  async deleteChannel(@MessageBody() channel: FindOneParams, @ConnectedSocket() socket: Socket) {
    const user = await this.chatsService.getUserFromSocket(socket);
    await this.chatsService.deleteChannel(channel, user);
    this.server.sockets.emit('channel_deleted', channel.id);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('join_channel')
  async joinChannel(@MessageBody() channel: FindOneParams, @ConnectedSocket() socket: Socket) {
    const user = await this.chatsService.getUserFromSocket(socket);
    const joined_channel = await this.chatsService.joinChannel(channel, user);
    this.sendToUsers(joined_channel.id, 'updated_channel', joined_channel);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('leave_channel')
  async leaveChannel(@MessageBody() channel: FindOneParams, @ConnectedSocket() socket: Socket) {
    const user = await this.chatsService.getUserFromSocket(socket);
    await this.chatsService.leaveChannel(channel, user);
    const updated_chan = await this.channelsService.getChannelById(channel.id);
    this.sendToUsers(updated_chan.id, 'updated_channel', updated_chan);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('channel_invitation')
  async manageChannelInvitation(@MessageBody() invitationData: ChannelInvitationDto, @ConnectedSocket() socket: Socket) {
    const user = await this.chatsService.getUserFromSocket(socket);
    const invitations = await this.chatsService.manageInvitation(invitationData, user);
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (socket of sockets) {
      const author = await this.chatsService.getUserFromSocket(socket);
      if (invitationData.invitedId === author.id) {
        socket.emit('invited_channels', invitations);
        return ;
      }
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('manage_channel_user')
  async updateChannelUser(@MessageBody() channelUserData: UpdateChannelUserDto, @ConnectedSocket() socket: Socket) {
    const user = await this.chatsService.getUserFromSocket(socket);
    const channel_user = await this.chatsService.updateChannelUser(channelUserData, user);
    this.sendToUsers(channel_user.channel.id, 'channel_user_updated', channel_user);
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('send_channel_message')
  async listenForMessages(@MessageBody() messageData: CreateMessageDto, @ConnectedSocket() socket: Socket) {
    const author = await this.chatsService.getUserFromSocket(socket);
    const message = await this.chatsService.saveChannelMessage(messageData, author);
    this.sendToUsers(message.channelId, 'receive_message', message);
  }

  // Direct Messages UwU

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('get_direct_messages_channel')
  async getDirectMessages(@MessageBody() userData: FindOneParams , @ConnectedSocket() socket: Socket) {
    const applicant  = await this.chatsService.getUserFromSocket(socket);
    const recipient = await this.usersService.getById(userData.id);
    const channel = await this.chatsService.getDirectMessagesChannel(applicant, recipient);
    socket.emit('get_direct_messages_channel', channel); 
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('send_direct_message')
  async listenForDirectMessages(@MessageBody() messageData: CreateDirectMessageDto, @ConnectedSocket() socket: Socket) {
    const author = await this.chatsService.getUserFromSocket(socket);
    const message = await this.chatsService.saveDirectMessage(messageData, author);
    const channel = await this.channelsService.getChannelById(message.channel.id);
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (socket of sockets) {
      const user = await this.chatsService.getUserFromSocket(socket);
      if (channel.channelUsers.find(chanUser => chanUser.user.id === user.id &&
        !user.blocked_users.find(blocked_user => blocked_user.id === message.author.id))) {
          socket.emit('receive_message', message);
          return ;
        }
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('manage_blocked_users')
  async blockUser(@MessageBody() to_be_blocked: FindOneParams, @ConnectedSocket() socket: Socket) {
    const user = await this.chatsService.getUserFromSocket(socket);
    const blocked_users = await this.chatsService.manageBlockedUsers(to_be_blocked, user);
    socket.emit('blocked_users', blocked_users);
  }
}