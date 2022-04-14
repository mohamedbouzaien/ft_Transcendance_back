import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import CreateChannelDto from "./dto/createChannel.dto";
import Channel from "./entities/channel.entity";
import { ChannelNotFoundException } from "./exception/channelNotFound.exception";
import * as bcrypt from 'bcrypt'
import UpdateChannelDto from "./dto/updateChannel.dto";
import { ChannelUsersService } from "./channelUser.service";

@Injectable()
export class ChannelsService {
  constructor (
    private readonly channelUsersService: ChannelUsersService,
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>, 
  ) {
  }

  async createChannel(channelData: CreateChannelDto) {
    const hashedPassword = await bcrypt.hash(channelData.password, 10);
    channelData.password = hashedPassword;
    const newChannel = await this.channelsRepository.create({
      ...channelData,
    })
    await this.channelsRepository.save(newChannel);    
    return newChannel;
  }

  async getChannelById(id: number) {
    const channel =  await this.channelsRepository.findOne(id, {relations: ['channelUsers', 'invited_members', 'messages']});
    if (!channel) {
      throw new ChannelNotFoundException(id);
    }
    return channel;
  }

  async checkChannelPassword(channel: Channel, wanted_channel: Channel) {
    const isPasswordMatching = await bcrypt.compare(channel.password, wanted_channel.password);
    if (!isPasswordMatching) {
      let error_message = (channel.password === '' ) ? 'need_password_for_channel' : 'wrong_password_for_channel';
      throw new HttpException(error_message, HttpStatus.BAD_REQUEST);
    }
    return wanted_channel;
  }

  async getAllChannels() {
    return await this.channelsRepository.find({relations: ['owner', 'channelUsers', 'messages']});
  }

  async getAllPublicChannels() {
    return await this.channelsRepository.find({
      where: {
        status: 'public',
      }
    })
  }

  async deleteChannel(id: number) {
    const deletedChannel = await this.channelsRepository.delete(id);
    if (!deletedChannel.affected) {
      throw new ChannelNotFoundException(id);
    }
  }
}