import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DuelsService } from 'src/duels/services/duel.service';
import { UserRelationshipsService } from 'src/user-relationships/user-relationships.service';
import { UserUnauthorizedException } from 'src/users/exception/userUnauthorized.exception';
import User from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { ChannelInvitationDto } from '../dto/ChannelInvitation.dto';
import CreateChannelDto from '../dto/createChannel.dto';
import CreateChannelUserDto from '../dto/createChannelUser.dto';
import CreateMessageDto from '../dto/createMessage.dto';
import { FindOneParams } from '../dto/findOneParams.dto';
import UpdateChannelDto from '../dto/updateChannel.dto';
import UpdateChannelUserDto from '../dto/updateChannelUser.dto';
import Channel, { ChannelStatus } from '../entities/channel.entity';
import { ChannelUserRole, SanctionType } from '../entities/channelUser.entity';
import { ChannelsService } from './channels.service';
import { ChannelUsersService } from './channelUser.service';
import { MessagesService } from './messages.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly channelsService: ChannelsService,
    private readonly usersService: UsersService,
    private readonly channelUsersService: ChannelUsersService,
    private readonly messagesService: MessagesService,
    private readonly duelsService: DuelsService,
    private readonly userRelationshipsService: UserRelationshipsService
  ) {
  }
 
  async createChannel(channelData: CreateChannelDto, user: User) {
    if (channelData.status === ChannelStatus.DIRECT_MESSAGE) {
      throw new HttpException('bad channel type', HttpStatus.BAD_REQUEST);
    }
    if (channelData.status !== ChannelStatus.PROTECTED) {
      channelData.password = '';
    }
    const channel = await this.channelsService.createChannel(channelData);
    await this.channelUsersService.createChannelUser({user, channelId: channel.id, role: ChannelUserRole.OWNER});   
    return await this.channelsService.getChannelById(channel.id);
  }

  async updateChannel(channelData: UpdateChannelDto, user: User) {
    const channel = await this.channelsService.getChannelById(channelData.id);
    const userChannel = user.userChannels.find(userChannel => userChannel.channelId === channel.id && userChannel.user.id === user.id);
    if (userChannel && userChannel.role !== ChannelUserRole.OWNER) {
      throw new UserUnauthorizedException(user.id);
    }
    for (let key in channelData) {
      if(!channelData[key]) {
        delete channelData[key];
      }
    }
    if (channelData.password && (channel.status == ChannelStatus.PROTECTED || channelData.status == ChannelStatus.PROTECTED)) {
      channelData.password = await bcrypt.hash(channelData.password, 10);
    }
    else {
      delete channelData['password'];
    }
    if (channelData.status && channelData.status !== ChannelStatus.PROTECTED) {
      channelData.password = '';
    }
    const updated_channel = await this.channelsService.updateChannel(channel.id, channelData);
    delete channelData['password'];
    return channelData;
  }

  async isUserBannedFromChannel(channelUser: UpdateChannelUserDto) {
    if (!channelUser || channelUser.sanction !== SanctionType.BAN) {
      return false;
    }
    else if (channelUser.end_of_sanction && channelUser.end_of_sanction.getTime() <= new Date().getTime()) {
      await this.channelUsersService.updateChannelUser(channelUser.id, {
        ...channelUser,
        sanction: null,
        end_of_sanction: null
      })
      return false;
    }
    return true;
  }

  async exctractAllChannelsForUser(user: User) {
    let user_channels : Channel[];
    user_channels = [];
    for (const userChannel of user.userChannels) {
      if (userChannel.sanction !== SanctionType.BAN || !this.isUserBannedFromChannel(userChannel)) {
        let channel = await this.channelsService.getChannelByIdWithSelectedRelations(userChannel.channelId, ['channelUsers']);
        if (channel.status !== ChannelStatus.DIRECT_MESSAGE) {
          delete channel.channelUsers
        }
        else {
          const dest = (channel.channelUsers[0].user.id == user.id) ? channel.channelUsers[1].user : channel.channelUsers[0].user;
          const isBlocked = await this.userRelationshipsService.checkBlockedUser(user.id, dest.id);
          if (isBlocked)
            continue;
        }
       user_channels.splice(user_channels.length, 0, channel);
      }
    }
     return user_channels
  }

  async getAllChannelsForUser(user: User) {
    const user_channels = await this.exctractAllChannelsForUser(user);
    const accessible_channels = await this.channelsService.getAllAccessibleChannels();
    const channels_ids = new Set(user.userChannels.map(userChannel => userChannel.channelId));
    const available_channels = [...accessible_channels.filter(channel => !channels_ids.has(channel.id))];
    const invited_channels = user.invited_channels;
    const channels = {
      user_channels,
      available_channels,
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
    else if (!channelUser && wanted_channel.status === ChannelStatus.PROTECTED) {
      await this.channelsService.checkChannelPassword(channel.password, wanted_channel.password);
    }
    return (await this.channelsService.getChannelById(channel.id));
  }

  async deleteChannel(channel: FindOneParams, user: User) {
    const wanted_channel = await this.channelsService.getChannelById(channel.id);
    if (wanted_channel.status === ChannelStatus.DIRECT_MESSAGE) {
      throw new UserUnauthorizedException(user.id);
    }
    const userChannel = user.userChannels.find(userChannel => userChannel.channelId === wanted_channel.id && userChannel.user.id === user.id);
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
    if ((wanted_channel.status === ChannelStatus.PRIVATE && !is_invited) || await this.isUserBannedFromChannel(channelUser)) {
      throw new UserUnauthorizedException(user.id);
    }
    if (channelUser) {
      throw new HttpException('user_already_member', HttpStatus.BAD_REQUEST);
    }
    if (wanted_channel.status === ChannelStatus.PROTECTED) {
      await this.channelsService.checkChannelPassword(channel.password, wanted_channel.password);
    }
    if (is_invited) {
      wanted_channel.invited_members.splice(wanted_channel.invited_members.indexOf(is_invited), 1);
      await this.channelsService.saveChannel(wanted_channel);
    }
    return await this.channelUsersService.createChannelUser({channelId: wanted_channel.id, user, role: ChannelUserRole.USER});
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
    if (await (await this.channelUsersService.deleteChannelUser(channel_user.id)).affected && wanted_channel.channelUsers.length == 1) {
      this.channelsService.deleteChannel(wanted_channel.id);
    }
    return channel_user;
  }

  async manageInvitation(invitationData: ChannelInvitationDto, user: User) {
    const invited_user = await this.usersService.getById(invitationData.invitedId);
    let channel = await this.channelsService.getChannelById(invitationData.channelId);
    if (channel.status === ChannelStatus.DIRECT_MESSAGE) {
      throw new UserUnauthorizedException(user.id);
    }
    let invitation =  channel.invited_members.find(member => member.id == user.id);
    if (user.id == invited_user.id) {
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
    return await (await this.usersService.getById(invited_user.id)).invited_channels;
  }

  async sendGameInvitation(sender: User, receiver: User) {
    const duels = await this.duelsService.getSpecificDuel(sender, receiver);
    if (duels.length)
      return duels[0];
    return await this.duelsService.createDuel({sender, receiver});
  }

  async updateChannelUser(channelUserData: UpdateChannelUserDto, user: User) {
    const affectedChannelUser = await this.channelUsersService.getChannelUserById(channelUserData.id);
    const channel = await this.channelsService.getChannelById(affectedChannelUser.channelId);
    if (channel.status === ChannelStatus.DIRECT_MESSAGE) {
      throw new UserUnauthorizedException(user.id);
    }
    const channelApplicant = user.userChannels.find(userChannel => userChannel.channelId === affectedChannelUser.channelId);
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
    const channelUser = await message_channel.channelUsers.find(channelUser => channelUser.user.id === author.id);

    if (!(channelUser))
      throw new UserUnauthorizedException(author.id);
    if (message_channel.status == ChannelStatus.DIRECT_MESSAGE) {
      const dest = (message_channel.channelUsers[0].user.id == author.id) ? message_channel.channelUsers[1].user : message_channel.channelUsers[0].user;
      const isBlocked = await this.userRelationshipsService.checkBlockedUser(dest.id, author.id);
      if (isBlocked)
        throw new UserUnauthorizedException(author.id);
    } 
    if (message_channel.status.toString() != ChannelStatus.DIRECT_MESSAGE && channelUser.sanction) {
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
      channelId: channel.id,
    };
    await this.channelUsersService.createChannelUser(channelUserData);
    channelUserData.user = recipient;
    await this.channelUsersService.createChannelUser(channelUserData);
    return await this.channelsService.getChannelById(channel.id);
  }

  async getDirectMessagesChannel(applicant: User, recipient: User) {
    const channel = await this.channelsService.getDirectMessagesChannel(applicant.id, recipient.id);
    if (!channel) {
      return await this.createDirectMessagesChannel(applicant, recipient);
    }
    return await this.channelsService.getChannelById(channel.id);
  }
}