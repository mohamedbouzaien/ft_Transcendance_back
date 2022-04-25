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
import { ChannelInvitationDto } from '../dto/ChannelInvitation.dto';
import { UsersService } from 'src/users/users.service';
import CreateMessageDto from '../dto/createMessage.dto';
import { MessagesService } from './messages.service';
import UpdateChannelDto from '../dto/updateChannel.dto';
import * as bcrypt from 'bcrypt'
import UpdateChannelUserDto from '../dto/updateChannelUser.dto';
import CreateChannelUserDto from '../dto/createChannelUser.dto';
import CreateDirectMessageDto from '../dto/createDirectMessage.dto';
import { FindOneParams } from '../dto/findOneParams.dto';

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
    if (channelData.status === ChannelStatus.DIRECT_MESSAGE) {
      throw new HttpException('bad channel type', HttpStatus.BAD_REQUEST);
    }
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
      if ('new_password' in channelData) {
        await this.channelsService.checkChannelPassword(channelData.password, channel.password);
        if (channelData.new_password !== null) {
          channelData.password = await bcrypt.hash(channelData.new_password, 10);
        }
        else {
          channelData.password = null
        }
        delete channelData['new_password'];
      }
      const updated_channel = await this.channelsService.updateChannel(channel.id, channelData);
      return updated_channel;
  }

  async isUserBannedFromChannel(channelUser: UpdateChannelUserDto) {
    if (!channelUser || channelUser.sanction !== SanctionType.BAN) {
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

  async getChannelForUser(channel: FindOneParams, user: User) {
    const wanted_channel = await this.channelsService.getChannelById(channel.id);
    const channelUser = await wanted_channel.channelUsers.find(channelUser => channelUser.user.id === user.id);
    if((!channelUser && wanted_channel.status === ChannelStatus.PRIVATE) || await this.isUserBannedFromChannel(channelUser)) {
      throw new UserUnauthorizedException(user.id);
    }
    return (await this.channelsService.getChannelById(channel.id));
  }

  async deleteChannel(channel: FindOneParams, user: User) {
    const wanted_channel = await this.channelsService.getChannelById(channel.id);
    if (wanted_channel.status === ChannelStatus.DIRECT_MESSAGE) {
      throw new UserUnauthorizedException(user.id);
    }
    const userChannel = user.userChannels.find(userChannel => userChannel.channel.id === wanted_channel.id && userChannel.user.id === user.id);
    if (userChannel && userChannel.role !== ChannelUserRole.OWNER) {
      throw new UserUnauthorizedException(user.id);
    }
    await this.channelsService.deleteChannel(wanted_channel.id)
  }

  async joinChannel(channel: FindOneParams, user: User) {
    let wanted_channel = await this.channelsService.getChannelById(channel.id);
    if (wanted_channel.status === ChannelStatus.DIRECT_MESSAGE) {
      throw new UserUnauthorizedException(user.id);
    }
    const channelUser = wanted_channel.channelUsers.find(channelUser => channelUser.user.id === user.id);
    let is_invited = wanted_channel.invited_members.find(member => member.id === user.id);
    if ((wanted_channel.status === 'private' && !is_invited) || await this.isUserBannedFromChannel(channelUser)) {
      throw new UserUnauthorizedException(user.id);
    }
    if (channelUser) {
      throw new HttpException('user_already_member', HttpStatus.BAD_REQUEST);
    }
    await this.channelsService.checkChannelPassword(channel.password, wanted_channel.password);
    if (is_invited) {
      wanted_channel.invited_members.splice(wanted_channel.invited_members.indexOf(is_invited), 1);
      await this.channelsService.saveChannel(wanted_channel);
    }
    await this.channelUsersService.createChannelUser({channel: wanted_channel, user, role: ChannelUserRole.USER});
    return (this.channelsService.getChannelById(wanted_channel.id));
  }

  async leaveChannel(channel: FindOneParams, user: User) {
    const wanted_channel = await this.channelsService.getChannelById(channel.id);
    if (wanted_channel.status === ChannelStatus.DIRECT_MESSAGE) {
      throw new UserUnauthorizedException(user.id);
    }
    const channel_user =  wanted_channel.channelUsers.find(channelUser => channelUser.user.id === user.id);
    if (!channel_user) {
      throw new UserUnauthorizedException(user.id);
    }
    await this.channelUsersService.deleteChannelUser(channel_user.id);
  }

  async manageInvitation(invitationData: ChannelInvitationDto, user: User) {
    const invited_user = await this.usersService.getById(invitationData.invitedId);
    let channel = await this.channelsService.getChannelById(invitationData.channelId);
    if (channel.status === ChannelStatus.DIRECT_MESSAGE) {
      throw new UserUnauthorizedException(user.id);
    }
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
      if (!(channelUser) || await this.isUserBannedFromChannel(channelUser)) {
        throw new UserUnauthorizedException(user.id);
      }
      else if (!invitation) {
        channel.invited_members.push(invited_user);
      }
    }
    const updated_channel = await this.channelsService.saveChannel(channel);
    return await (await this.usersService.getById(invited_user.id)).invited_channels;;
  }

  async updateChannelUser(channelUserData: UpdateChannelUserDto, user: User) {
    const affectedChannelUser = await this.channelUsersService.getChannelUserById(channelUserData.id);
    const channel = await this.channelsService.getChannelById(affectedChannelUser.channel.id);
    if (channel.status === ChannelStatus.DIRECT_MESSAGE) {
      throw new UserUnauthorizedException(user.id);
    }
    const channelApplicant = user.userChannels.find(userChannel => userChannel.channel.id === affectedChannelUser.channel.id);
    if (channelUserData.role) {
      if (!channelApplicant || channelApplicant.role !== ChannelUserRole.OWNER) {
        throw new UserUnauthorizedException(user.id);
      }
    }
    if (channelUserData.sanction) {
      if (affectedChannelUser.user.id === channelApplicant.user.id || channelApplicant.sanction || 
        !channelApplicant || channelApplicant.role === ChannelUserRole.USER || 
        (channelApplicant.role > ChannelUserRole.USER && channelApplicant.role < affectedChannelUser.role)) {
          throw new UserUnauthorizedException(user.id);
        }
    }
    return await this.channelUsersService.updateChannelUser(affectedChannelUser.id, channelUserData); 
  }

  async saveChannelMessage(messageData: CreateMessageDto, author: User) {
    const message_channel = await this.channelsService.getChannelById(messageData.channelId);
    if (message_channel.status === ChannelStatus.DIRECT_MESSAGE) {
      throw new UserUnauthorizedException(author.id);
    }
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
    const newMessage = await this.messagesService.saveMessage(messageData, author, message_channel);
    return newMessage;
  }

  // Direct Message UwU


  async createDirectMessagesChannel(applicant: User, recipient: User) {
    let channelData: CreateChannelDto;
    channelData = {
      ...channelData,
      status: ChannelStatus.DIRECT_MESSAGE,
    }
    const channel = await this.channelsService.createChannel(channelData);
    let channelUserData: CreateChannelUserDto = {
      user: applicant,
      role: ChannelUserRole.USER,
      channel
    };
    await this.channelUsersService.createChannelUser(channelUserData);
    channelUserData.user = recipient;
    await this.channelUsersService.createChannelUser(channelUserData);
    return await this.channelsService.getChannelById(channel.id);
  }

  async getDirectMessagesChannel(applicant: User, recipient: User) {
    let channelUser = await applicant.userChannels.find(userChannel => {
      if (userChannel.channel.status === ChannelStatus.DIRECT_MESSAGE &&
      recipient.userChannels.find(recipChannel => recipChannel.channel.id === userChannel.channel.id)) {
        return userChannel;
      }
      });
    if (!channelUser) {
      return await this.createDirectMessagesChannel(applicant, recipient);
    }
    return await this.channelsService.getChannelById(channelUser.channel.id);
  }

  async saveDirectMessage(directMessageData: CreateDirectMessageDto, author: User) {
    let channel: Channel;

    if (directMessageData.channelId) {
      channel = await this.channelsService.getChannelById(directMessageData.channelId);
      if (channel.status !== ChannelStatus.DIRECT_MESSAGE || !channel.channelUsers.find(userChannel => userChannel.user.id === author.id)) {
        throw new UserUnauthorizedException(author.id);
      }
    }
    else {
      const recipient = await this.usersService.getById(directMessageData.recipientId);
      channel = await this.getDirectMessagesChannel(author, recipient);
    }
    if (channel.status !== ChannelStatus.DIRECT_MESSAGE) {
      throw new UserUnauthorizedException(author.id);
    }
    return await this.messagesService.saveMessage(directMessageData, author, channel);
  }

  async manageBlockedUsers(to_be_blocked: FindOneParams, user: User) {
    const target = await this.usersService.getById(to_be_blocked.id);
    if (target.id === user.id) {
      throw new UserUnauthorizedException(user.id);
    }
    if (user.blocked_users.find(blocked => blocked.id === target.id)) {
      user.blocked_users.splice(user.blocked_users.indexOf(target), 1);
    }
    else {
      user.blocked_users.splice(0, 0, target);
    }
    return await (await this.usersService.saveUser(user)).blocked_users;
  }
}