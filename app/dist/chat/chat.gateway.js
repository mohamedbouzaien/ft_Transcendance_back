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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const users_service_1 = require("../users/users.service");
const channels_service_1 = require("./services/channels.service");
const chat_service_1 = require("./services/chat.service");
const ChannelInvitation_dto_1 = require("./dto/ChannelInvitation.dto");
const createChannel_dto_1 = require("./dto/createChannel.dto");
const createMessage_dto_1 = require("./dto/createMessage.dto");
const updateChannel_dto_1 = require("./dto/updateChannel.dto");
const updateChannelUser_dto_1 = require("./dto/updateChannelUser.dto");
const channelUser_entity_1 = require("./entities/channelUser.entity");
const createDirectMessage_dto_1 = require("./dto/createDirectMessage.dto");
const common_1 = require("@nestjs/common");
const WsException_filter_1 = require("./exception/WsException.filter");
const findOneParams_dto_1 = require("./dto/findOneParams.dto");
let ChatGateway = class ChatGateway {
    constructor(chatsService, channelsService, usersService) {
        this.chatsService = chatsService;
        this.channelsService = channelsService;
        this.usersService = usersService;
    }
    async handleConnection(socket) {
        this.requestAllChannels(socket);
    }
    async sendToUsers(channelId, event, to_send) {
        const sockets = Array.from(this.server.sockets.sockets.values());
        for (let socket of sockets) {
            const user = await this.chatsService.getUserFromSocket(socket);
            if (user.userChannels.find(userChannel => userChannel.channel.id === channelId && userChannel.sanction !== channelUser_entity_1.SanctionType.BAN)) {
                socket.emit(event, to_send);
            }
        }
    }
    async requestAllChannels(socket) {
        const user = await this.chatsService.getUserFromSocket(socket);
        const channels = await this.chatsService.getAllChannelsForUser(user);
        socket.emit('get_all_channels', channels);
    }
    async requestChannel(channelData, socket) {
        console.log(channelData);
        const user = await this.chatsService.getUserFromSocket(socket);
        const channel = await this.chatsService.getChannelForUser(channelData, user);
        console.log(channel);
        socket.emit('get_channel', channel);
    }
    async createChannel(channelData, socket) {
        const owner = await this.chatsService.getUserFromSocket(socket);
        const channel = await this.chatsService.createChannel(channelData, owner);
        if (channel.status === 'public') {
            this.server.sockets.emit('channel_created', channel);
        }
        else {
            socket.emit('channel_created', channel);
        }
    }
    async updateChannel(channelData, socket) {
        const user = await this.chatsService.getUserFromSocket(socket);
        const updated_channel = await this.chatsService.updateChannel(channelData, user);
        this.sendToUsers(updated_channel.id, 'updated_channel', updated_channel);
    }
    async deleteChannel(channel, socket) {
        const user = await this.chatsService.getUserFromSocket(socket);
        await this.chatsService.deleteChannel(channel, user);
        this.server.sockets.emit('channel_deleted', channel.id);
    }
    async joinChannel(channel, socket) {
        const user = await this.chatsService.getUserFromSocket(socket);
        const joined_channel = await this.chatsService.joinChannel(channel, user);
        this.sendToUsers(joined_channel.id, 'updated_channel', joined_channel);
    }
    async leaveChannel(channel, socket) {
        const user = await this.chatsService.getUserFromSocket(socket);
        await this.chatsService.leaveChannel(channel, user);
        const updated_chan = await this.channelsService.getChannelById(channel.id);
        this.sendToUsers(updated_chan.id, 'updated_channel', updated_chan);
    }
    async manageChannelInvitation(invitationData, socket) {
        const user = await this.chatsService.getUserFromSocket(socket);
        const invitations = await this.chatsService.manageInvitation(invitationData, user);
        const sockets = Array.from(this.server.sockets.sockets.values());
        for (socket of sockets) {
            const author = await this.chatsService.getUserFromSocket(socket);
            if (invitationData.invitedId === author.id) {
                socket.emit('invited_channels', invitations);
                return;
            }
        }
    }
    async updateChannelUser(channelUserData, socket) {
        const user = await this.chatsService.getUserFromSocket(socket);
        const channel_user = await this.chatsService.updateChannelUser(channelUserData, user);
        this.sendToUsers(channel_user.channel.id, 'channel_user_updated', channel_user);
    }
    async listenForMessages(messageData, socket) {
        const author = await this.chatsService.getUserFromSocket(socket);
        const message = await this.chatsService.saveChannelMessage(messageData, author);
        const channel = await this.channelsService.getChannelById(message.channel.id);
        this.sendToUsers(channel.id, 'receive_message', message);
    }
    async getDirectMessages(userData, socket) {
        const applicant = await this.chatsService.getUserFromSocket(socket);
        const recipient = await this.usersService.getById(userData.id);
        const channel = await this.chatsService.getDirectMessagesChannel(applicant, recipient);
        socket.emit('get_direct_messages_channel', channel);
    }
    async listenForDirectMessages(messageData, socket) {
        const author = await this.chatsService.getUserFromSocket(socket);
        const message = await this.chatsService.saveDirectMessage(messageData, author);
        const channel = await this.channelsService.getChannelById(message.channel.id);
        const sockets = Array.from(this.server.sockets.sockets.values());
        for (socket of sockets) {
            const user = await this.chatsService.getUserFromSocket(socket);
            if (channel.channelUsers.find(chanUser => chanUser.user.id === user.id &&
                !user.blocked_users.find(blocked_user => blocked_user.id === message.author.id))) {
                socket.emit('receive_message', message);
                return;
            }
        }
    }
    async blockUser(to_be_blocked, socket) {
        const user = await this.chatsService.getUserFromSocket(socket);
        const blocked_users = await this.chatsService.manageBlockedUsers(to_be_blocked, user);
        socket.emit('blocked_users', blocked_users);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('request_all_channels'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "requestAllChannels", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('request_channel'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [findOneParams_dto_1.FindOneParams, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "requestChannel", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('create_channel'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createChannel_dto_1.default, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "createChannel", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('update_channel'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateChannel_dto_1.default, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "updateChannel", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('delete_channel'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [findOneParams_dto_1.FindOneParams, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "deleteChannel", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('join_channel'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [findOneParams_dto_1.FindOneParams, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "joinChannel", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('leave_channel'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [findOneParams_dto_1.FindOneParams, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "leaveChannel", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('channel_invitation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ChannelInvitation_dto_1.ChannelInvitationDto, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "manageChannelInvitation", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('manage_channel_user'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateChannelUser_dto_1.default, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "updateChannelUser", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('send_channel_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createMessage_dto_1.default, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "listenForMessages", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('get_direct_messages_channel'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [findOneParams_dto_1.FindOneParams, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "getDirectMessages", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('send_direct_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [createDirectMessage_dto_1.default, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "listenForDirectMessages", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, websockets_1.SubscribeMessage)('manage_blocked_users'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [findOneParams_dto_1.FindOneParams, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "blockUser", null);
ChatGateway = __decorate([
    (0, common_1.UseFilters)(WsException_filter_1.WsExceptionFilter),
    (0, websockets_1.WebSocketGateway)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        channels_service_1.ChannelsService,
        users_service_1.UsersService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map