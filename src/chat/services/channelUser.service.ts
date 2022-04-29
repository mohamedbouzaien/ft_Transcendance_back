import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import CreateChannelUserDto from "../dto/createChannelUser.dto";
import UpdateChannelUserDto from "../dto/updateChannelUser.dto";
import ChannelUser from "../entities/channelUser.entity";
import { ChannelUserNotFoundException } from '../exception/channelUserNotFound.exception'
@Injectable()
export class ChannelUsersService {
  constructor(
    @InjectRepository(ChannelUser)
    private readonly channelUsersRepository: Repository<ChannelUser>
    ) {}

    async getChannelUserById(id: number) {
      const channelUser = this.channelUsersRepository.findOne(id, {relations: ['user']});
      if (!channelUser) {
        throw new ChannelUserNotFoundException(id);
      }
      return (channelUser);
    }
    async createChannelUser(channelUserData: CreateChannelUserDto) {
      const newChannelUser = await this.channelUsersRepository.create({
        ...channelUserData,
      });
      await this.channelUsersRepository.save(newChannelUser);
      return newChannelUser;
    }

    async updateChannelUser(id: number, channelUserData: UpdateChannelUserDto) {
      await this.channelUsersRepository.update(id, channelUserData);
      const updatedChannelUser = await this.getChannelUserById(id);
      if (!updatedChannelUser) {
        throw new ChannelUserNotFoundException(id);
      }
      return updatedChannelUser;
    }

    async deleteChannelUser(id: number) {
      const deleted_channelUser = await this.channelUsersRepository.delete(id);
      if (!deleted_channelUser.affected) {
        throw new ChannelUserNotFoundException(id);
      }
      return deleted_channelUser;
    }
}