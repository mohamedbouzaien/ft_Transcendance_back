import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import JwtAuthenticationGuard from "src/authentication/jwt-authentication.guard";
import RequestWithUser from "src/authentication/request-with-user.interface";
import { UsersService } from "src/users/users.service";
import { ChatGateway } from "../chat.gateway";
import CreateChannelDto from "../dto/createChannel.dto";
import { FindOneParams } from "../dto/findOneParams.dto";
import UpdateChannelDto from "../dto/updateChannel.dto";
import { ChannelsService } from "../services/channels.service";
import { ChatService } from "../services/chat.service";

@UseInterceptors(ClassSerializerInterceptor)
@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly chatsService: ChatService,
    private readonly channelsService: ChannelsService,
    private readonly chatGateway: ChatGateway,
    private readonly usersService: UsersService
    ) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createChannel(@Req() request: RequestWithUser, @Body() channelData: CreateChannelDto) {
    const user = await this.usersService.getUserWithRelations(request.user.id, []);
    return await this.chatsService.createChannel(channelData, user);
  }

  @Get()
  @UseGuards(JwtAuthenticationGuard)
  async getAllChannels(@Req() request: RequestWithUser) {
    const user = await this.usersService.getUserWithRelations(request.user.id, ['userChannels', 'invited_channels']);
    return await this.chatsService.getAllChannelsForUser(user);
  }

  @Get(':id')
  @UseGuards(JwtAuthenticationGuard)
  async getChannel(@Req() request: RequestWithUser, @Param() channelData: FindOneParams) {
    const user = await this.usersService.getUserWithRelations(request.user.id, []);
    return await this.chatsService.getChannelForUser(channelData, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthenticationGuard)
  async updateChannel(@Req() request: RequestWithUser, @Body() channelData: UpdateChannelDto) {
    const user = await this.usersService.getUserWithRelations(request.user.id, ['userChannels']);
    const channel = await this.chatsService.updateChannel(channelData, user);
    this.chatGateway.sendToUsers(channel.id, 'updated_channel', channel);
    return channel;
  }

  @Delete(':id')
  @UseGuards(JwtAuthenticationGuard)
  async deleteChannel(@Req() request: RequestWithUser, @Param() channelData: FindOneParams) {
    const user = await this.usersService.getUserWithRelations(request.user.id, ['userChannels']);
    const channelUsers = await (await this.channelsService.getChannelById(channelData.id)).channelUsers;
    await this.chatsService.deleteChannel(channelData, user);
    this.chatGateway.sendDeletiontoUsers(channelUsers, channelData.id);
  }
}
