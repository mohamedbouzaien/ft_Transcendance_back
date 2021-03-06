import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UsersService } from "src/users/users.service";
import { ChannelsService } from "./services/channels.service";
import { ChatService } from "./services/chat.service";
import { ChannelInvitationDto } from "./dto/ChannelInvitation.dto";
import CreateMessageDto from "./dto/createMessage.dto";
import UpdateChannelUserDto from "./dto/updateChannelUser.dto";
import ChannelUser, { SanctionType } from "./entities/channelUser.entity";
import {ClassSerializerInterceptor, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { WsExceptionFilter } from "./exception/WsException.filter";
import { FindOneParams } from "./dto/findOneParams.dto";
import User from "src/users/user.entity";
import Channel from "./entities/channel.entity";
import { ChannelUsersService } from "./services/channelUser.service";
import { UserStatus } from "src/users/user-status.enum";
import { AuthenticationService } from "src/authentication/authentication.service";
import { DuelsService } from "src/duels/services/duel.service";
import { UserUnauthorizedException } from "src/users/exception/userUnauthorized.exception";

@UseFilters(WsExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
@WebSocketGateway(
  { cors: {
  origin: process.env.FRONT_URL,
  methods: ["GET", "POST"],
  credentials: true
}}
)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatsService: ChatService, 
    private readonly channelsService: ChannelsService,
    private readonly channelUsersService: ChannelUsersService,
    private readonly usersService: UsersService,
    private readonly authenticationService: AuthenticationService,
    private readonly duelsService: DuelsService
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

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const user = await this.authenticationService.getUserFromSocket(socket);
    socket.data.user = user;
    await this.usersService.setStatus(UserStatus.ONLINE, user.id);
  }


  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const user = await this.authenticationService.getUserFromSocket(socket);
    await this.usersService.setStatus(UserStatus.OFFLINE, user.id);
  }

  async sendDeletiontoUsers(channelUsers: ChannelUser[], id: number) {
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (let socket of sockets) {
      if (channelUsers.find(channelUser => channelUser.user.id == socket.data.user.id && channelUser.sanction !== SanctionType.BAN)) {
        socket.emit('deleted_channel', {id});
      }
    }
  }

  async sendBanToUser(channelId: number, userId: number) {
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (let socket of sockets) {
      const user = await this.usersService.getUserWithRelations(socket.data.user.id, ['userChannels']);
      if (user.id === userId && user.userChannels.find(userChannel => userChannel.channelId == channelId))
        socket.emit('user_banned', channelId);
    }
  }

  async sendToUsers(channelId: number, event: string, to_send: any) {
    const sockets :any[] = Array.from(this.server.sockets.sockets.values());

    for (let socket of sockets) {
      const user = await this.usersService.getUserWithRelations(socket.data.user.id, ['userChannels']);
      if (user.userChannels.find(userChannel => userChannel.channelId == channelId && userChannel.sanction !== SanctionType.BAN))
        socket.emit(event, to_send);
    }
  }

  async checkChannelUserSanction() {
    let sanctionned = await this.channelUsersService.getTemporarySanctionnedChannelUsers();
    for (const channelUser of sanctionned) {
      if (channelUser.end_of_sanction.getTime() <= new Date().getTime()) {
        if (channelUser.sanction == SanctionType.MUTE) {
          let updated = await this.channelUsersService.updateChannelUser(channelUser.id, {
            ...channelUser,
            sanction: null,
            end_of_sanction: null
          })
          this.sendToUsers(updated.channelId, 'channel_user', await this.serializeBroadcastedEntity(updated));
        }
        else {
          this.channelUsersService.deleteChannelUser(channelUser.id);
        }
      }
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('join_channel')
  async joinChannel(@MessageBody() channel: FindOneParams, @ConnectedSocket() socket: Socket) : Promise<any>{
    try {
      const channelUser = await this.chatsService.joinChannel(channel, socket.data.user);
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
      const data = await this.chatsService.leaveChannel(channel, socket.data.user);
      this.sendToUsers(channel.id, 'left_channel', data);
      return data;
    } catch (error) {
      return {error, channel};
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('channel_invitation')
  async manageChannelInvitation(@MessageBody() invitationData: ChannelInvitationDto, @ConnectedSocket() socket: Socket) {
    try {
      const invitations = await this.chatsService.manageInvitation(invitationData, socket.data.user);
      const sockets :any[] = Array.from(this.server.sockets.sockets.values());
      for (let sock of sockets) {
        if (invitationData.invitedId == sock.data.user.id) {
          sock.emit('invited_channels', await this.serializeBroadcastedInvitations(invitations));
          return 'rejected';
        }
      }
    } catch (error) {
      return {error, invitationData};
    }
    return 'yo'
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('manage_channel_user')
  async updateChannelUser(@MessageBody() channelUserData: UpdateChannelUserDto, @ConnectedSocket() socket: Socket) {
    try {
      const user = await this.usersService.getUserWithRelations(socket.data.user.id, ['userChannels']);
      const channel_user = await this.chatsService.updateChannelUser(channelUserData, user);
      this.sendToUsers(channel_user.channelId, 'channel_user', await this.serializeBroadcastedEntity(channel_user));
      if (channelUserData.sanction == 'ban')
          await this.sendBanToUser(channel_user.channelId, channel_user.user.id)
    } catch (error) {
      return {error, channelUserData};
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('send_channel_message')
  async listenForMessages(@MessageBody() messageData: CreateMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      const message = await this.chatsService.saveChannelMessage(messageData, socket.data.user);
      this.sendToUsers(message.channelId, 'receive_message', await this.serializeBroadcastedEntity(message));
    } catch (error) {
      return {error, messageData};
    }
  } 

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('get_direct_messages_channel')
  async getDirectMessages(@MessageBody() userData: FindOneParams , @ConnectedSocket() socket: Socket) : Promise<any>{
    try {
      const recipient = await this.usersService.getUserWithRelations(userData.id, []);
      const channel = await this.chatsService.getDirectMessagesChannel(socket.data.user, recipient);
      return channel;
    } catch (error) {
      return {error, userData};
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('sendGameInvitation')
  async sendGameInvitation(@MessageBody() data: FindOneParams, @ConnectedSocket() socket: Socket) {
    try {
      const recipient = await this.usersService.getUserWithRelations(data.id, []);
      const duel = await this.chatsService.sendGameInvitation(socket.data.user, recipient);
      const sockets :any[] = Array.from(this.server.sockets.sockets.values());

      for (let sock of sockets) {
        if ((sock.data.user.id == duel.sender.id || sock.data.user.id == duel.receiver.id) && sock.data.user.id != socket.data.user.id) {
          sock.emit('newDuelInvitation', duel);
          break;
        }
      }
    } catch (error) {
      console.log(error);
      return {error, data};
    }
  }

  @UsePipes(new ValidationPipe())
  @SubscribeMessage('deleteDuelInvitation')
  async deleteDuelInvitation(@ConnectedSocket() socket: Socket, @MessageBody() data: FindOneParams) {
    try {
      const duel = await this.duelsService.getDuelById(data.id);
      if (duel.sender.id != socket.data.user.id && duel.receiver.id != socket.data.user.id)
        throw new UserUnauthorizedException(socket.data.user.id);
      await this.duelsService.deleteDuel(duel.id);
      const sockets :any[] = Array.from(this.server.sockets.sockets.values());

      for (let sock of sockets) {
        if (sock.data.user.id == duel.sender.id || sock.data.user.id == duel.receiver.id)
          sock.emit('deletedDuelInvitation', duel);
      }
    } catch (error) {
      return (error);
    }
  }
}