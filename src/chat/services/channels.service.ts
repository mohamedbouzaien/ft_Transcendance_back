import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import CreateChannelDto from "../dto/createChannel.dto";
import Channel, { ChannelStatus } from "../entities/channel.entity";
import { ChannelNotFoundException } from "../exception/channelNotFound.exception";
import * as bcrypt from 'bcrypt'
import UpdateChannelDto from "../dto/updateChannel.dto";
import { ChannelUsersService } from "./channelUser.service";
import { PasswordErrorException } from "../exception/passwordError.exception";

@Injectable()
export class ChannelsService {
  constructor (
    private readonly channelUsersService: ChannelUsersService,
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>, 
  ) {
  }

  async createChannel(channelData: CreateChannelDto) {
    if (channelData.status === ChannelStatus.PROTECTED) {
      const hashedPassword = await bcrypt.hash(channelData.password, 10);
      channelData.password = hashedPassword;
    }
    else {
      channelData.password = '';
    }
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

  async getVanillaChannelById(id: number) {
    const channel =  await this.channelsRepository.findOne(id);
    if (!channel) {
      throw new ChannelNotFoundException(id);
    }
    return channel;
  }
  async getDirectMessagesChannel(userId1: number, userId2: number) {
    return await this.channelsRepository.createQueryBuilder("channel")
    .innerJoinAndSelect("channel.channelUsers", "channelUser")
    .where("channelUser.user.id = :userId1", { userId1 })
    .where("channelUser.user.id = :userId2", { userId2 })
    .andWhere("channel.status = :status", {status: 'direct_message'})
    .getOne();
  }

  async checkChannelPassword(plain_password: string, hashed_password: string) {
    if (hashed_password === '') {
      return true;
    }
    if (!plain_password) {
      throw new PasswordErrorException('need_password_for_channel');
    }
    const isPasswordMatching = await bcrypt.compare(plain_password, hashed_password);
    if (!isPasswordMatching) {
      let error_message = (plain_password === '' ) ? 'need_password_for_channel' : 'wrong_password_for_channel';
      throw new PasswordErrorException(error_message);
    }
    return true;
  }

  async getAllChannels() {
    return await this.channelsRepository.find({relations: ['channelUsers', 'messages']});
  }

  async getAllDirectMessagesChannels() {
    return await this.channelsRepository.find({where:{
      status: ChannelStatus.DIRECT_MESSAGE,
    }})
  }
  async getAllAccessibleChannels() {
    return await this.channelsRepository.find({
      where: {
        status: In(['public', 'protected']),
      }
    })
  }

  async saveChannel(channel: Channel) {
    const updated_channel = await this.channelsRepository.save(channel);
    if (!updated_channel) {
      throw new ChannelNotFoundException(channel.id);
    }
    return updated_channel;
  }
  async updateChannel(id: number, channelData: UpdateChannelDto) {
    await this.channelsRepository.update(id, channelData);
    const updatedPost = await this.getChannelById(id);
    if (!updatedPost) {
      throw new ChannelNotFoundException(id);
    }
    return updatedPost;
  }

  async deleteChannel(id: number) {
    const deletedChannel = await this.channelsRepository.delete(id);
    if (!deletedChannel.affected) {
      throw new ChannelNotFoundException(id);
    }
  }
}