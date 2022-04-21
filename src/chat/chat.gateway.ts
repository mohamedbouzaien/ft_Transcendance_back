import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UsersService } from "src/users/users.service";
import { ChannelsService } from "./services/channels.service";
import { ChatService } from "./services/chat.service";
import { ChannelInvitationDto } from "./dto/ChannelInvitation.dto";
import CreateChannelDto from "./dto/createChannel.dto";
import CreateMessageDto from "./dto/createMessage.dto";
import UpdateChannelDto from "./dto/updateChannel.dto";
import UpdateChannelPasswordDto from "./dto/updateChannelPassword.dto";
import UpdateChannelUserDto from "./dto/updateChannelUser.dto";
import Channel, { ChannelStatus } from "./entities/channel.entity";
import { SanctionType } from "./entities/channelUser.entity";
import User from "src/users/user.entity";
import CreateDirectMessageDto from "./dto/createDirectMessage.dto";
import {UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { WsExceptionFilter } from "./exception/WsException.filter";
import { FindOneParams } from "./dto/findOneParams.dto";

@UseFilters(WsExceptionFilter)
@WebSocketGateway()
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

  async sendChannel(channel: Channel, event: string) {
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (let socket of sockets) {
      const user = await this.chatsService.getUserFromSocket(socket);
      if (channel.channelUsers.find(channelUser => channelUser.user.id === user.id && channelUser.sanction !== SanctionType.BAN)) {
        socket.emit(event, channel);
      }
    }
  }

  @SubscribeMessage('request_all_channels')
  async requestAllChannels(@ConnectedSocket() socket: Socket) {
    try {
      const user = await this.chatsService.getUserFromSocket(socket);
      const channels = await this.chatsService.getAllChannelsForUser(user);
      socket.emit('get_all_channels', channels);
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
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
    const user = await this.chatsService.getUserFromSocket(socket);
    const updated_channel = await this.chatsService.updateChannel(channelData, user);
    this.sendChannel(updated_channel, 'updated_channel');
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
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
    console.log(joined_channel);
    this.sendChannel(joined_channel, 'updated_channel');
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('leave_channel')
  async leaveChannel(@MessageBody() channel: FindOneParams, @ConnectedSocket() socket: Socket) {
    const user = await this.chatsService.getUserFromSocket(socket);
    await this.chatsService.leaveChannel(channel, user);
    const updated_chan = await this.channelsService.getChannelById(channel.id);
    this.sendChannel(updated_chan, 'updated_channel');
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

  @SubscribeMessage('manage_channel_user_sanction')
  async manageChannelUserSanction(@MessageBody() punishmentData: UpdateChannelUserDto, @ConnectedSocket() socket: Socket) {
    try {
      const user = await this.chatsService.getUserFromSocket(socket);
      console.log(punishmentData);
      const punishment = await this.chatsService.manageChannelUserSanction(punishmentData, user);
      console.log(punishment);
    }
    catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  }
  
  @SubscribeMessage('update_password')
  async updateChannelPassword(@MessageBody() passwordData: UpdateChannelPasswordDto, @ConnectedSocket() socket: Socket) {
    try {
      const user = await this.chatsService.getUserFromSocket(socket);
      const channel_user = await this.chatsService.updateChannelPassword(passwordData, user);
    }
    catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  }

  @SubscribeMessage('update_channel_user')
  async updateChannelUser(@MessageBody() channelUserData: UpdateChannelUserDto, @ConnectedSocket() socket: Socket) {
    try {
      const user = await this.chatsService.getUserFromSocket(socket);
      const channel_user = await this.chatsService.updateChannelUser(channelUserData, user);
    }
    catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  }

  @SubscribeMessage('send_channel_message')
  async listenForMessages(@MessageBody() messageData: CreateMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      const author = await this.chatsService.getUserFromSocket(socket);
      const message = await this.chatsService.saveChannelMessage(messageData, author);
      const channel = await this.channelsService.getChannelById(message.channel.id);
      this.sendChannel(channel, 'receive_message');
    }
    catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  }

  // Direct Messages UwU

  @SubscribeMessage('get_direct_messages_channel')
  async getDirectMessages(@MessageBody() userData: User , @ConnectedSocket() socket: Socket) {
    try {
      const applicant  = await this.chatsService.getUserFromSocket(socket);
      const recipient = await this.usersService.getById(userData.id);
      const channel = await this.chatsService.getDirectMessagesChannel(applicant, recipient);
      console.log(channel);
      socket.emit('get_direct_messages_channel', channel);
    }
    catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  }

  @SubscribeMessage('send_direct_message')
  async listenForDirectMessages(@MessageBody() messageData: CreateDirectMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      console.log(messageData);
      const author = await this.chatsService.getUserFromSocket(socket);
      const message = await this.chatsService.saveDirectMessage(messageData, author);
      const channel = await this.channelsService.getChannelById(message.channel.id);
      console.log(message);
      const sockets :any[] = Array.from(this.server.sockets.sockets.values());

      for (socket of sockets) {
        const user = await this.chatsService.getUserFromSocket(socket);
        if (channel.channelUsers.find(chanUser => chanUser.user.id === user.id &&
          !user.blocked_users.find(blocked_user => blocked_user.id === message.author.id))) {
            console.log('emit to ', user.email);
            socket.emit('receive_message', message);
            return ;
          }
      }
    }
    catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  }

  @SubscribeMessage('manage_blocked_users')
  async blockUser(@MessageBody() to_be_blocked: User, @ConnectedSocket() socket: Socket) {
    try {
      const user = await this.chatsService.getUserFromSocket(socket);
      const blocked_users = await this.chatsService.manageBlockedUsers(to_be_blocked, user);
      console.log(blocked_users);
      socket.emit('blocked_users', blocked_users);
    } catch (error) {
      console.log(error);
      socket.emit('error', error);
    }
  }
}