import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import User from "src/users/user.entity";
import { Repository } from "typeorm";
import CreateChannelUserDto from "./dto/createChannelUser.dto";
import Channel from "./entities/channel.entity";
import ChannelUser from "./entities/channelUser.entity";

@Injectable()
export class ChannelUsersService {
  constructor(
    @InjectRepository(ChannelUser)
    private readonly channelUsersRepository: Repository<ChannelUser>
    ) {}

    async createChannelUser(channelUserData: CreateChannelUserDto) {
      const newChannelUser = await this.channelUsersRepository.create({
        ...channelUserData,
      });
      await this.channelUsersRepository.save(newChannelUser);
      return newChannelUser;
    }
}