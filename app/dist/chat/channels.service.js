"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const channel_entity_1 = require("./entities/channel.entity");
const channelNotFound_exception_1 = require("./exception/channelNotFound.exception");
const bcrypt = require("bcrypt");
const channelUser_service_1 = require("./channelUser.service");
let ChannelsService = class ChannelsService {
    constructor(channelUsersService, channelsRepository) {
        this.channelUsersService = channelUsersService;
        this.channelsRepository = channelsRepository;
    }
    async createChannel(channelData) {
        const hashedPassword = await bcrypt.hash(channelData.password, 10);
        channelData.password = hashedPassword;
        const newChannel = await this.channelsRepository.create(Object.assign({}, channelData));
        await this.channelsRepository.save(newChannel);
        return newChannel;
    }
    async getChannelById(id) {
        const channel = await this.channelsRepository.findOne(id, { relations: ['channelUsers', 'invited_members', 'messages'] });
        if (!channel) {
            throw new channelNotFound_exception_1.ChannelNotFoundException(id);
        }
        return channel;
    }
    async checkChannelPassword(plain_password, hashed_password) {
        const isPasswordMatching = await bcrypt.compare(plain_password, hashed_password);
        if (!isPasswordMatching) {
            let error_message = (plain_password === '') ? 'need_password_for_channel' : 'wrong_password_for_channel';
            throw new common_1.HttpException(error_message, common_1.HttpStatus.BAD_REQUEST);
        }
        return true;
    }
    async getAllChannels() {
        return await this.channelsRepository.find({ relations: ['owner', 'channelUsers', 'messages'] });
    }
    async getAllPublicChannels() {
        return await this.channelsRepository.find({
            where: {
                status: 'public',
            }
        });
    }
    async saveChannel(channel) {
        const updated_channel = await this.channelsRepository.save(channel);
        if (!updated_channel) {
            throw new channelNotFound_exception_1.ChannelNotFoundException(channel.id);
        }
        return updated_channel;
    }
    async updateChannel(id, channelData) {
        await this.channelsRepository.update(id, channelData);
        const updatedPost = await this.getChannelById(id);
        if (!updatedPost) {
            throw new channelNotFound_exception_1.ChannelNotFoundException(id);
        }
        return updatedPost;
    }
    async deleteChannel(id) {
        const deletedChannel = await this.channelsRepository.delete(id);
        if (!deletedChannel.affected) {
            throw new channelNotFound_exception_1.ChannelNotFoundException(id);
        }
    }
};
ChannelsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(channel_entity_1.default)),
    __metadata("design:paramtypes", [channelUser_service_1.ChannelUsersService,
        typeorm_2.Repository])
], ChannelsService);
exports.ChannelsService = ChannelsService;
//# sourceMappingURL=channels.service.js.map