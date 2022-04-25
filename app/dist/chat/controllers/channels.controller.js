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
exports.ChannelsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_authentication_guard_1 = require("../../authentication/jwt-authentication.guard");
const users_service_1 = require("../../users/users.service");
const createChannel_dto_1 = require("../dto/createChannel.dto");
const findOneParams_dto_1 = require("../dto/findOneParams.dto");
const updateChannel_dto_1 = require("../dto/updateChannel.dto");
const channels_service_1 = require("../services/channels.service");
const chat_service_1 = require("../services/chat.service");
let ChannelsController = class ChannelsController {
    constructor(chatsService, channelsService, usersService) {
        this.chatsService = chatsService;
        this.channelsService = channelsService;
        this.usersService = usersService;
    }
    async createChannel(request, channelData) {
        const user = await this.usersService.getById(request.user.id);
        return await this.chatsService.createChannel(channelData, user);
    }
    async getAllChannels(request) {
        const user = await this.usersService.getById(request.user.id);
        return await this.chatsService.getAllChannelsForUser(user);
    }
    async getChannel(request, channelData) {
        const user = await this.usersService.getById(request.user.id);
        return await this.chatsService.getChannelForUser(channelData, user);
    }
    async updateChannel(request, channelData) {
        const user = await this.usersService.getById(request.user.id);
        return await this.chatsService.updateChannel(channelData, user);
    }
    async deleteChannel(request, channelData) {
        const user = await this.usersService.getById(request.user.id);
        return await this.chatsService.deleteChannel(channelData, user);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_authentication_guard_1.default),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, createChannel_dto_1.default]),
    __metadata("design:returntype", Promise)
], ChannelsController.prototype, "createChannel", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_authentication_guard_1.default),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChannelsController.prototype, "getAllChannels", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_authentication_guard_1.default),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, findOneParams_dto_1.FindOneParams]),
    __metadata("design:returntype", Promise)
], ChannelsController.prototype, "getChannel", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_authentication_guard_1.default),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, updateChannel_dto_1.default]),
    __metadata("design:returntype", Promise)
], ChannelsController.prototype, "updateChannel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_authentication_guard_1.default),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, findOneParams_dto_1.FindOneParams]),
    __metadata("design:returntype", Promise)
], ChannelsController.prototype, "deleteChannel", null);
ChannelsController = __decorate([
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, common_1.Controller)('channels'),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        channels_service_1.ChannelsService,
        users_service_1.UsersService])
], ChannelsController);
exports.ChannelsController = ChannelsController;
//# sourceMappingURL=channels.controller.js.map