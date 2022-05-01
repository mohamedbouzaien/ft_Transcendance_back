import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UsersService } from "src/users/users.service";
import { ChannelsService } from "./services/channels.service";
import { ChatService } from "./services/chat.service";
import { ChannelInvitationDto } from "./dto/ChannelInvitation.dto";
import CreateMessageDto from "./dto/createMessage.dto";
import UpdateChannelUserDto from "./dto/updateChannelUser.dto";
import ChannelUser, { SanctionType } from "./entities/channelUser.entity";
import CreateDirectMessageDto from "./dto/createDirectMessage.dto";
import {ClassSerializerInterceptor, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { WsExceptionFilter } from "./exception/WsException.filter";
import { FindOneParams } from "./dto/findOneParams.dto";
import { WsResponseImplementation } from "./serialisationTools/wsResponse.implementation";
import User from "src/users/user.entity";
import Channel from "./entities/channel.entity";

@UseFilters(WsExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
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

  async serializeBroadcastedUser(user: User) {
    for (let key in user) {
      if (key != 'id' && key != 'username' && key != 'avatar_id'
      && key != 'status' && key != 'victories' && key != 'defeats') {
        delete user[key];
      }
    }
    return user;
  }

  async serializeBroadcastedInvitations(invitations: Channel[]) {
    invitations.forEach(invitation => {
      delete invitation['password'], delete invitation['last_message_at']
    });
    return invitations;
  }

  async serializeBroadcastedEntity(data: any) {
    if (data.user) {
      data.user = await this.serializeBroadcastedUser(data.user);
    }
    else if (data.author) {
      data.author = await this.serializeBroadcastedUser(data.author);
    }
    return data;
  }

  async handleConnection(socket: Socket) {
    //this.requestAllChannels(socket);
  }

  async sendDeletiontoUsers(channelUsers: ChannelUser[], id: number) {
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (let socket of sockets) {
      const user = await this.chatsService.getUserFromSocket(socket);
      if (channelUsers.find(channelUser => channelUser.user.id == user.id && channelUser.sanction !== SanctionType.BAN)) {
        socket.emit('deleted_channel', {id});
      }
    }
  }

  async sendToUsers(channelId: number, event: string, to_send: any) {
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (let socket of sockets) {
      const user = await this.chatsService.getUserFromSocket(socket);
      if (user.userChannels.find(userChannel => userChannel.channelId == channelId && userChannel.sanction !== SanctionType.BAN)) {
        socket.emit(event, to_send);
      }
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('join_channel')
  async joinChannel(@MessageBody() channel: FindOneParams, @ConnectedSocket() socket: Socket) : Promise<any>{
    try {
      const user = await this.chatsService.getUserFromSocket(socket);
      const channelUser = await this.chatsService.joinChannel(channel, user);
      this.sendToUsers(channelUser.channelId, 'channel_user', await this.serializeBroadcastedEntity(channelUser));
      return await this.channelsService.getChannelById(channelUser.channelId);
    } catch (error) {
      return {error, channel};
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('leave_channel')
  async leaveChannel(@MessageBody() channel: FindOneParams, @ConnectedSocket() socket: Socket) : Promise<any>{
    try {
      const user = await this.chatsService.getUserFromSocket(socket);
      const data = await this.chatsService.leaveChannel(channel, user);
      this.sendToUsers(channel.id, 'leaved_channel', data);
      return data;
    } catch (error) {
      return {error, channel};
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('channel_invitation')
  async manageChannelInvitation(@MessageBody() invitationData: ChannelInvitationDto, @ConnectedSocket() socket: Socket) {
    try {
      const user = await this.chatsService.getUserFromSocket(socket);
      const invitations = await this.chatsService.manageInvitation(invitationData, user);
      const sockets :any[] = Array.from(this.server.sockets.sockets.values());
      for (socket of sockets) {
        const author = await this.chatsService.getUserFromSocket(socket);
        if (invitationData.invitedId === author.id) {
          socket.emit('invited_channels', await this.serializeBroadcastedInvitations(invitations));
          return ;
        }
      }
    } catch (error) {
      return {error, invitationData};
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('manage_channel_user')
  async updateChannelUser(@MessageBody() channelUserData: UpdateChannelUserDto, @ConnectedSocket() socket: Socket) {
    try {
      const user = await this.chatsService.getUserFromSocket(socket);
      const channel_user = await this.chatsService.updateChannelUser(channelUserData, user);
      this.sendToUsers(channel_user.channelId, 'channel_user', await this.serializeBroadcastedEntity(channel_user));
    } catch (error) {
      return {error, channelUserData};
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('send_channel_message')
  async listenForMessages(@MessageBody() messageData: CreateMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      const author = await this.chatsService.getUserFromSocket(socket);
      const message = await this.chatsService.saveChannelMessage(messageData, author);
      this.sendToUsers(message.channelId, 'receive_message', await this.serializeBroadcastedEntity(message));
    } catch (error) {
      return {error, messageData};
    }
  }

  // Direct Messages UwU

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('get_direct_messages_channel')
  async getDirectMessages(@MessageBody() userData: FindOneParams , @ConnectedSocket() socket: Socket) : Promise<any>{
    try {
      const applicant  = await this.chatsService.getUserFromSocket(socket);
      const recipient = await this.usersService.getById(userData.id);
      const channel = await this.chatsService.getDirectMessagesChannel(applicant, recipient);
      return channel;
    } catch (error) {
      return {error, userData};
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('send_direct_message')
  async listenForDirectMessages(@MessageBody() messageData: CreateDirectMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      const author = await this.chatsService.getUserFromSocket(socket);
      const message = await this.chatsService.saveDirectMessage(messageData, author);
      const channel = await this.channelsService.getChannelById(message.channelId);
      const sockets :any[] = Array.from(this.server.sockets.sockets.values());

      for (socket of sockets) {
        const user = await this.chatsService.getUserFromSocket(socket);
        if (channel.channelUsers.find(chanUser => chanUser.user.id === user.id &&
          !user.blocked_users.find(blocked_user => blocked_user.id === message.author.id))) {
            socket.emit('receive_message', await this.serializeBroadcastedEntity(message));
            return ;
          }
      }
    } catch (error) {
      return (error);
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('manage_blocked_users')
  async blockUser(@MessageBody() to_be_blocked: FindOneParams, @ConnectedSocket() socket: Socket) {
    const user = await this.chatsService.getUserFromSocket(socket);
    const blocked_users = await this.chatsService.manageBlockedUsers(to_be_blocked, user);
    return {event: 'blocked_users', blocked_users};
  }
}


// HTTP REQUEST NOW 

/*
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
  async createChannel(@MessageBody() channelData: CreateChannelDto, @ConnectedSocket() socket: Socket): Promise<WsResponseImplementation<any>> {
    const owner = await this.chatsService.getUserFromSocket(socket);
    const channel = await this.chatsService.createChannel(channelData, owner);
    if (channel.status === ChannelStatus.PUBLIC) {
      this.server.sockets.emit('channel_created', channel);
    }
    else {
      return { event: 'channel_created', data: channel };
    }
    return { event: 'channel_created', data: channel };
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
  }*/