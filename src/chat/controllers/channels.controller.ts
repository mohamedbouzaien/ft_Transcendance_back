import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import JwtAuthenticationGuard from "src/authentication/jwt-authentication.guard";
import RequestWithUser from "src/authentication/request-with-user.interface";
import { UsersService } from "src/users/users.service";
import CreateChannelDto from "../dto/createChannel.dto";
import { FindOneParams } from "../dto/findOneParams.dto";
import { ChannelsService } from "../services/channels.service";
import { ChatService } from "../services/chat.service";

@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly chatsService: ChatService,
    private readonly channelsService: ChannelsService,
    private readonly usersService: UsersService
    ) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createChannel(@Req() request: RequestWithUser, @Body() channelData: CreateChannelDto) {
    const user = await this.usersService.getById(request.user.id);
    return await this.chatsService.createChannel(channelData, user);
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  async getAllChannels(@Req() request: RequestWithUser) {
    const user = await this.usersService.getById(request.user.id);
    return await this.chatsService.getAllChannelsForUser(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthenticationGuard)
  async getChannel(@Req() request: RequestWithUser, @Param() channelData: FindOneParams) {
    const user = await this.usersService.getById(request.user.id);
    return await this.chatsService.getChannelForUser(channelData, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  async deleteChannel(@Req() request: RequestWithUser, @Param() channelData: FindOneParams) {
    const user = await this.usersService.getById(request.user.id);
    return await this.chatsService.deleteChannel(channelData, user);
  }
}
