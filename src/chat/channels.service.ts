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
import { use } from "passport";

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

  async isUserChannelMember(channel: Channel, user: User) : Promise<boolean> {
    let is_already_member = false;
    await channel.members.forEach((member) => {
      if (member.id === user.id) {
        is_already_member = true;
        return ;
      }
    })
    return is_already_member; 
  }

  async isUserChannelAdmin(channel: Channel, user: User) : Promise<boolean> {
    let is_admin = false;
    if (channel.owner.id === user.id) {
      return true;
    }
    if (channel.admins_id == null) {
      return is_admin;
    }
    await channel.admins_id.forEach((admin_id) => {
      if (admin_id === user.id) {
        is_admin = true;
        return ;
      }
    })
    return is_admin; 
  }

  async getChannelByUser(channel: Channel, user: User) {
    const wanted_channel = await this.getChannelById(channel.id);
    let is_already_member = await this.isUserChannelMember(wanted_channel, user);
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
    let is_invited = false;
    let index = 0

    let is_already_member = false;
    wanted_channel.members.forEach((member) => {
      if (member.id === user.id) {
        is_already_member = true;
        return ;
      }
    })
    if (is_already_member) {
      throw new HttpException('user_already_member', HttpStatus.BAD_REQUEST);
    }
    wanted_channel.invited_members.forEach((invited_member) => {
      if (invited_member.id === user.id) {
        is_invited = true;
        return ;
      }
      index++;
    })
    if (wanted_channel.status === 'private' && is_invited === false) {
      throw new UserUnauthorizedException(user.id);
    }
    if (is_invited) {
      wanted_channel.invited_members.splice(index, 1);
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

  async updateChannel(id: number, channelData: UpdateChannelDto, user: User) {
    const channel = await this.getChannelById(id);
    if ((await this.isUserChannelMember(channel, user) === false) ||
    (channelData.admins_id && channelData.admins_id !== [] && (await this.isUserChannelAdmin(channel, user) === false))) {
      throw new UserUnauthorizedException(user.id);
    }
    const updated_channel = await this.channelsRepository.update(id, channelData);
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