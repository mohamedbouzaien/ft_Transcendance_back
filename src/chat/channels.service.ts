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
    if (!channelData.members.find(user => { return user.id === owner.id})) {
      await channelData.members.splice(0, 0, owner);
    }
    const newChannel = await this.channelsRepository.create({
      ...channelData,
      owner,
    })
    await this.channelsRepository.save(newChannel);
    return newChannel;
  }

  async getChannelById(id: number) {
    const channel =  await this.channelsRepository.findOne(id, {relations: ['owner', 'members', 'messages']});
    if (!channel)
    throw new ChannelNotFoundException(id);
    return channel;
  }

  async getChannelByUser(channel: Channel, user: User) {
    const wanted_channel = await this.getChannelById(channel.id);
    const isPasswordMatching = await bcrypt.compare(channel.password, wanted_channel.password);
    if (!isPasswordMatching) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST);
    }
    return wanted_channel;
  }

  async getAllChannels() {
    return await this.channelsRepository.find({relations: ['owner', 'members', 'messages']});
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