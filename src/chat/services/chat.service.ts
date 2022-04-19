import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthenticationService } from '../../authentication/authentication.service';
import { Socket } from 'socket.io';
import { parse } from 'cookie';
import { WsException } from '@nestjs/websockets';
import CreateChannelDto from '../dto/createChannel.dto';
import User from 'src/users/user.entity';
import { ChannelsService } from './channels.service';
import { ChannelUsersService } from './channelUser.service';
import ChannelUser, { ChannelUserRole, SanctionType } from '../entities/channelUser.entity';
import Channel, { ChannelStatus } from '../entities/channel.entity';
import { UserUnauthorizedException } from 'src/users/exception/userUnauthorized.exception';
import ChannelInvitationDto from '../dto/ChannelInvitation.dto';
import { UsersService } from 'src/users/users.service';
import CreateMessageDto from '../dto/createMessage.dto';
import { MessagesService } from './messages.service';
import UpdateChannelDto from '../dto/updateChannel.dto';
import * as bcrypt from 'bcrypt'
import UpdateChannelUserDto from '../dto/updateChannelUser.dto';
import UpdateChannelPasswordDto from '../dto/updateChannelPassword.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly channelsService: ChannelsService,
    private readonly usersService: UsersService,
    private readonly channelUsersService: ChannelUsersService,
    private readonly messagesService: MessagesService
  ) {
  }
 
  async getUserFromSocket(socket: Socket) {
    const cookie = socket.handshake.headers.cookie;
    const { Authentication: authenticationToken } = parse(cookie);
    const user = await this.authenticationService.getUserFromAuthenticationToken(authenticationToken);
    if (!user) {
      throw new WsException('Invalid credentials.');
    }
    return user;
  }

  async createChannel(channelData: CreateChannelDto, user: User) {
    const channel = await this.channelsService.createChannel(channelData);
    const channelUser = await this.channelUsersService.createChannelUser({user, channel, role: ChannelUserRole.OWNER});   
    return await this.channelsService.getChannelById(channel.id);
  }

  async updateChannel(channelData: UpdateChannelDto, user: User) {
    const channel = await this.channelsService.getChannelById(channelData.id);
    const userChannel = user.userChannels.find(userChannel => userChannel.channel.id === channel.id && userChannel.user.id
     === user.id);
     if (userChannel && userChannel.role !== ChannelUserRole.OWNER) {
       throw new UserUnauthorizedException(user.id);
      }
      if ('password' in channelData) {
        channelData.password = await bcrypt.hash(channelData.password, 10);
      }
      console.log(channelData);
      if ('invited_members' in channelData) {
        delete channelData['invited_members']
      }
      console.log(channelData);
      const updated_channel = await this.channelsService.updateChannel(channel.id, channelData);
      return updated_channel;
  }

  async isUserBannedFromChannel(channelUser: UpdateChannelUserDto) {
    if (channelUser.sanction !== SanctionType.BAN) {
      return false;
    }
    else if (channelUser.end_of_sanction && channelUser.end_of_sanction.getTime() <= new Date().getTime()) {
      console.log('ban ended');
      await this.channelUsersService.updateChannelUser(channelUser.id, {
        ...channelUser,
        sanction: null,
        end_of_sanction: null
      })
      return false;
    }
    console.log('banned');
    return true;
  }

  async exctractAllChannelsForUser(user: User) {
    let user_channels : Channel[];
    user_channels = [];
     user.userChannels.forEach(userChannel => {
       if (userChannel.sanction !== SanctionType.BAN || !this.isUserBannedFromChannel(userChannel)) {
        user_channels.splice(user_channels.length, 0, userChannel.channel);
       }
     });
     return user_channels
  }

  async getAllChannelsForUser(user: User) {
    const user_channels = await this.exctractAllChannelsForUser(user);
    const public_channels = await this.channelsService.getAllPublicChannels();
    const channels_ids = new Set(user_channels.map(channel => channel.id));
    const avalaible_channels = [...user_channels, ...public_channels.filter(channel => !channels_ids.has(channel.id))];
    const invited_channels = user.invited_channels;
    const channels = {
      user_channels,
      avalaible_channels,
      invited_channels
    }
    return (channels);
  }

  async getChannelForUser(channel: Channel, user: User) {
    const wanted_channel = await this.channelsService.getChannelById(channel.id);
    const channelUser = await wanted_channel.channelUsers.find(channelUser => channelUser.user.id === user.id);
    if((!channelUser && wanted_channel.status === ChannelStatus.PRIVATE) || await this.isUserBannedFromChannel(channelUser)) {
      throw new UserUnauthorizedException(user.id);
    }
    return (await this.channelsService.getChannelById(channel.id));
  }

  async deleteChannel(channel: Channel, user: User) {
    const wanted_channel = await this.channelsService.getChannelById(channel.id)
    const userChannel = user.userChannels.find(userChannel => userChannel.channel.id === wanted_channel.id && userChannel.user.id === user.id);
    if (userChannel && userChannel.role !== ChannelUserRole.OWNER) {
      throw new UserUnauthorizedException(user.id);
    }
    await this.channelsService.deleteChannel(wanted_channel.id)
  }

  async joinChannel(channel: Channel, user: User) {
    let wanted_channel = await this.channelsService.getChannelById(channel.id);
    const channelUser = wanted_channel.channelUsers.find(channelUser => channelUser.user.id === user.id);
    let is_invited = wanted_channel.invited_members.find(member => member.id === user.id);
    if ((wanted_channel.status === 'private' && !is_invited) || await this.isUserBannedFromChannel(channelUser)) {
      throw new UserUnauthorizedException(user.id);
    }
    if (channelUser) {
      throw new HttpException('user_already_member', HttpStatus.BAD_REQUEST);
    }
    if (is_invited) {
      wanted_channel.invited_members.splice(wanted_channel.invited_members.indexOf(is_invited), 1);
    }
    await this.channelsService.checkChannelPassword(channel.password, wanted_channel.password);
    await this.channelUsersService.createChannelUser({channel: wanted_channel, user, role: ChannelUserRole.USER});
    return (this.channelsService.getChannelById(wanted_channel.id));
  }

  async leaveChannel(channel: Channel, user: User) {
    const wanted_channel = await this.channelsService.getChannelById(channel.id);
    const channel_user =  wanted_channel.channelUsers.find(channelUser => channelUser.user.id === user.id);
    if (!channel_user) {
      throw new UserUnauthorizedException(user.id);
    }
    await this.channelUsersService.deleteChannelUser(channel_user.id);
  }

  async updateChannelPassword(passwordData: UpdateChannelPasswordDto, user: User) {
    const channel = await this.channelsService.getChannelById(passwordData.id);
    const userChannel = user.userChannels.find(userChannel => userChannel.channel.id === channel.id && userChannel.user.id === user.id);
    if (userChannel && userChannel.role !== ChannelUserRole.OWNER) {
      throw new UserUnauthorizedException(user.id);
    }
    await this.channelsService.checkChannelPassword(passwordData.old_password, channel.password);
    const new_hashed_password = await bcrypt.hash(passwordData.new_password, 10);
    let updateChannel: UpdateChannelDto;
    updateChannel = {
      id: channel.id,
      password: new_hashed_password
    }
    return await this.channelsService.updateChannel(channel.id, updateChannel);
  }

  async manageInvitation(invitationData: ChannelInvitationDto, user: User) {
    const invited_user = await this.usersService.getById(invitationData.invited_user.id);
    let channel = await this.channelsService.getChannelById(invitationData.channel.id);
    let invitation =  channel.invited_members.find(member => member.id === user.id);
    if (user.id === invited_user.id) {
      if (invitation) {
        channel.invited_members.splice(channel.invited_members.indexOf(invitation), 1);
      }
      else {
        throw new UserUnauthorizedException(user.id);
      }
    }
    else {
      const channelUser = channel.channelUsers.find(channelUser => channelUser.user.id === user.id);
      if (!(channelUser) || this.isUserBannedFromChannel(channelUser)) {
        throw new UserUnauthorizedException(user.id);
      }
      else if (!invitation) {
        channel.invited_members.push(invited_user);
      }
    }
    const updated_channel = await this.channelsService.saveChannel(channel);
    return updated_channel;
  }

  async manageChannelUserSanction(punishment: UpdateChannelUserDto, user: User) {
    const channelPunished = await this.channelUsersService.getChannelUserById(punishment.id);
    const channelPunisher = user.userChannels.find(userChannel => userChannel.user.id === user.id);
    if (channelPunisher.sanction || 
      !channelPunisher || channelPunisher.role === ChannelUserRole.USER || 
      (channelPunisher.role > ChannelUserRole.USER && channelPunisher.role < channelPunished.role)) {
        throw new UserUnauthorizedException(user.id);
      }
    return await this.channelUsersService.updateChannelUser(channelPunished.id, punishment);
  }

  async updateChannelUser(channelUserData: UpdateChannelUserDto, user: User) {
    const channelUser = await this.channelUsersService.getChannelUserById(channelUserData.id);
    const isChannelOwner = user.userChannels.find(userChannel => userChannel.channel.id === channelUser.channel.id);
    if (!isChannelOwner || isChannelOwner.role !== ChannelUserRole.OWNER) {
        throw new UserUnauthorizedException(user.id);
      }
    return await this.channelUsersService.updateChannelUser(channelUser.id, channelUserData); 
  }

  async saveMessage(messageData: CreateMessageDto, author: User) {
    const message_channel = await this.channelsService.getChannelById(messageData.channel.id);
    const channelUser = await message_channel.channelUsers.find(channelUser => channelUser.user.id === author.id);
    if (!(channelUser)) {
      throw new UserUnauthorizedException(author.id);
    }
    if (channelUser.sanction) {
      if (channelUser.end_of_sanction && channelUser.end_of_sanction.getTime() <= new Date().getTime()) {
        console.log('sanction ended');
        this.channelUsersService.updateChannelUser(channelUser.id, {
          ...channelUser,
          sanction: null,
          end_of_sanction: null 
        })
      }
      else {
        throw new UserUnauthorizedException(author.id);
      }
    }
    const newMessage = await this.messagesService.saveMessage({
      ...messageData,
      author
    });
    return newMessage;
  }
}