import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { use } from "passport";
import { AuthenticationService } from "src/authentication/authentication.service";
import User from "src/users/user.entity";
import { Repository } from "typeorm";
import CreateChannelDto from "./dto/createChannel.dto";
import Channel from "./entities/channel.entity";

@Injectable()
export class ChannelsService {
  constructor (
    private readonly authenticationService: AuthenticationService,
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>, 
  ) {
  }

  async createChannel(channelData: CreateChannelDto, owner: User) {

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
    return await this.channelsRepository.findOne(id, {relations: ['owner', 'members', 'messages']});
  }
  async getAllChannels() {
    return await this.channelsRepository.find({relations: ['owner', 'members', 'messages']});
  }

  async deleteChannel(channel: Channel, user: User) {
    if (channel.owner.id !== user.id) {
      throw new HttpException('User not allowed', HttpStatus.NOT_FOUND);
    }
    const deletedChannel = await this.channelsRepository.delete(channel.id);
    if (!deletedChannel.affected) {
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    }
  }
}