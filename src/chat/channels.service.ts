import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthenticationService } from "src/authentication/authentication.service";
import { UserUnauthorizedException } from "src/users/exception/userUnauthorized.exception";
import User from "src/users/user.entity";
import { Repository } from "typeorm";
import CreateChannelDto from "./dto/createChannel.dto";
import Channel from "./entities/channel.entity";
import { ChannelNotFoundException } from "./exception/channelNotFound.exception";
import * as bcrypt from 'bcrypt'
import UpdateChannelDto from "./dto/updateChannel.dto";

@Injectable()
export class ChannelsService {
  constructor (
    private readonly authenticationService: AuthenticationService,
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>, 
  ) {
  }

  async createChannel(channelData: CreateChannelDto, owner: User) {

    const hashedPassword = await bcrypt.hash(channelData.password, 10);
    channelData.password = hashedPassword;
    /*if (!channelData.members.find(user => { return user.id === owner.id})) {
      await channelData.members.splice(0, 0, owner);
    }*/
    const newChannel = await this.channelsRepository.create({
      ...channelData,
      owner,
    })
    await this.channelsRepository.save(newChannel);
    return newChannel;
  }

  async getChannelById(id: number) {
    const channel =  await this.channelsRepository.findOne(id, {relations: ['owner', 'members', 'invited_members', 'messages']});
    if (!channel)
    throw new ChannelNotFoundException(id);
    return channel;
  }

  async getChannelByUser(channel: Channel, user: User) {
    const wanted_channel = await this.getChannelById(channel.id);
    let is_already_member = wanted_channel.members.find(member => member.id === user.id);
    if (is_already_member || wanted_channel.status === 'public') {
      return (channel);
    }
    throw new UserUnauthorizedException(user.id);
  }

  async checkChannelPassword(channel: Channel, wanted_channel: Channel) {
    const isPasswordMatching = await bcrypt.compare(channel.password, wanted_channel.password);
    if (!isPasswordMatching) {
      let error_message = (channel.password === '' ) ? 'need_password_for_channel' : 'wrong_password_for_channel';
      throw new HttpException(error_message, HttpStatus.BAD_REQUEST);
    }
    return wanted_channel;
  }

  async addUserToChannel(channel: Channel, user: User) {
    const wanted_channel = await this.getChannelById(channel.id);
    const is_already_member = wanted_channel.members.find(member => member.id === user.id);

    if (is_already_member) {
      throw new HttpException('user_already_member', HttpStatus.BAD_REQUEST);
    }
    let is_invited = wanted_channel.invited_members.find(member => member.id === user.id);
    if (wanted_channel.status === 'private' && !is_invited) {
      throw new UserUnauthorizedException(user.id);
    }
    if (is_invited) {
      wanted_channel.invited_members.splice(wanted_channel.invited_members.indexOf(is_invited), 1);
    }
    this.checkChannelPassword(channel, wanted_channel);
    wanted_channel.members.splice(0, 0, user);
    this.channelsRepository.save(wanted_channel);
    return (wanted_channel);
  }

  async getAllChannels() {
    return await this.channelsRepository.find({relations: ['owner', 'members', 'messages']});
  }

  async getAllChannelsForUser(user :User) {
    let user_channels = user.channels;
    let public_channels = await this.channelsRepository.find({
      where: {
        status: 'public',
      }
    });
    var channels_ids = new Set(user_channels.map(channel => channel.id));
    var merged = [...user_channels, ...public_channels.filter(channel => !channels_ids.has(channel.id))];
    return (merged);
  }

  async manageInvitation(id: number, invited_user: User, user: User) {
    let channel = await this.getChannelById(id);
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
      if (!(channel.members.find(member => member.id === user.id))) {
        throw new UserUnauthorizedException(user.id);
      }
      else if (!invitation) {
        channel.invited_members.splice(0, 0, invited_user);
      }
    }
    const updated_channel = await this.channelsRepository.save(channel);
    return updated_channel;
  }

  async updateChannel(id: number, channelData: UpdateChannelDto, user: User) {
    const channel = await this.getChannelById(id);
    if (channel.owner.id !== user.id) {
      throw new UserUnauthorizedException(user.id);
    }
    if ('password' in channelData) {
      channelData.password = await bcrypt.hash(channelData.password, 10);
    }
    await this.channelsRepository.update(id, channelData);
    const updated_channel = this.getChannelById(id);
    if (updated_channel) {
      return updated_channel;
    }
    throw new ChannelNotFoundException(channel.id);
  }

  async deleteChannel(channel: Channel, user: User) {
    if (channel.owner.id !== user.id) {
      throw new UserUnauthorizedException(user.id);
    }
    const deletedChannel = await this.channelsRepository.delete(channel.id);
    if (!deletedChannel.affected) {
      throw new ChannelNotFoundException(channel.id);
    }
  }


}