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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const authentication_service_1 = require("../../authentication/authentication.service");
const cookie_1 = require("cookie");
const websockets_1 = require("@nestjs/websockets");
const channels_service_1 = require("./channels.service");
const channelUser_service_1 = require("./channelUser.service");
const channelUser_entity_1 = require("../entities/channelUser.entity");
const channel_entity_1 = require("../entities/channel.entity");
const userUnauthorized_exception_1 = require("../../users/exception/userUnauthorized.exception");
const users_service_1 = require("../../users/users.service");
const messages_service_1 = require("./messages.service");
const bcrypt = require("bcrypt");
let ChatService = class ChatService {
    constructor(authenticationService, channelsService, usersService, channelUsersService, messagesService) {
        this.authenticationService = authenticationService;
        this.channelsService = channelsService;
        this.usersService = usersService;
        this.channelUsersService = channelUsersService;
        this.messagesService = messagesService;
    }
    async getUserFromSocket(socket) {
        const cookie = socket.handshake.headers.cookie;
        const { Authentication: authenticationToken } = (0, cookie_1.parse)(cookie);
        const user = await this.authenticationService.getUserFromAuthenticationToken(authenticationToken);
        if (!user) {
            throw new websockets_1.WsException('Invalid credentials.');
        }
        return user;
    }
    async createChannel(channelData, user) {
        if (channelData.status === channel_entity_1.ChannelStatus.DIRECT_MESSAGE) {
            throw new common_1.HttpException('bad channel type', common_1.HttpStatus.BAD_REQUEST);
        }
        const channel = await this.channelsService.createChannel(channelData);
        const channelUser = await this.channelUsersService.createChannelUser({ user, channel, role: channelUser_entity_1.ChannelUserRole.OWNER });
        return await this.channelsService.getChannelById(channel.id);
    }
    async updateChannel(channelData, user) {
        const channel = await this.channelsService.getChannelById(channelData.id);
        const userChannel = user.userChannels.find(userChannel => userChannel.channel.id === channel.id && userChannel.user.id
            === user.id);
        if (userChannel && userChannel.role !== channelUser_entity_1.ChannelUserRole.OWNER) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
        }
        if ('new_password' in channelData) {
            await this.channelsService.checkChannelPassword(channelData.password, channel.password);
            if (channelData.new_password !== null) {
                channelData.password = await bcrypt.hash(channelData.new_password, 10);
            }
            else {
                channelData.password = null;
            }
            delete channelData['new_password'];
        }
        const updated_channel = await this.channelsService.updateChannel(channel.id, channelData);
        return updated_channel;
    }
    async isUserBannedFromChannel(channelUser) {
        if (!channelUser || channelUser.sanction !== channelUser_entity_1.SanctionType.BAN) {
            return false;
        }
        else if (channelUser.end_of_sanction && channelUser.end_of_sanction.getTime() <= new Date().getTime()) {
            console.log('ban ended');
            await this.channelUsersService.updateChannelUser(channelUser.id, Object.assign(Object.assign({}, channelUser), { sanction: null, end_of_sanction: null }));
            return false;
        }
        console.log('banned');
        return true;
    }
    async exctractAllChannelsForUser(user) {
        let user_channels;
        user_channels = [];
        user.userChannels.forEach(userChannel => {
            if (userChannel.sanction !== channelUser_entity_1.SanctionType.BAN || !this.isUserBannedFromChannel(userChannel)) {
                user_channels.splice(user_channels.length, 0, userChannel.channel);
            }
        });
        return user_channels;
    }
    async getAllChannelsForUser(user) {
        const user_channels = await this.exctractAllChannelsForUser(user);
        const public_channels = await this.channelsService.getAllPublicChannels();
        const channels_ids = new Set(user_channels.map(channel => channel.id));
        const avalaible_channels = [...user_channels, ...public_channels.filter(channel => !channels_ids.has(channel.id))];
        const invited_channels = user.invited_channels;
        const channels = {
            user_channels,
            avalaible_channels,
            invited_channels
        };
        return (channels);
    }
    async getChannelForUser(channel, user) {
        const wanted_channel = await this.channelsService.getChannelById(channel.id);
        const channelUser = await wanted_channel.channelUsers.find(channelUser => channelUser.user.id === user.id);
        if ((!channelUser && wanted_channel.status === channel_entity_1.ChannelStatus.PRIVATE) || await this.isUserBannedFromChannel(channelUser)) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
        }
        return (await this.channelsService.getChannelById(channel.id));
    }
    async deleteChannel(channel, user) {
        const wanted_channel = await this.channelsService.getChannelById(channel.id);
        if (wanted_channel.status === channel_entity_1.ChannelStatus.DIRECT_MESSAGE) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
        }
        const userChannel = user.userChannels.find(userChannel => userChannel.channel.id === wanted_channel.id && userChannel.user.id === user.id);
        if (userChannel && userChannel.role !== channelUser_entity_1.ChannelUserRole.OWNER) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
        }
        await this.channelsService.deleteChannel(wanted_channel.id);
    }
    async joinChannel(channel, user) {
        let wanted_channel = await this.channelsService.getChannelById(channel.id);
        if (wanted_channel.status === channel_entity_1.ChannelStatus.DIRECT_MESSAGE) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
        }
        const channelUser = wanted_channel.channelUsers.find(channelUser => channelUser.user.id === user.id);
        let is_invited = wanted_channel.invited_members.find(member => member.id === user.id);
        if ((wanted_channel.status === 'private' && !is_invited) || await this.isUserBannedFromChannel(channelUser)) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
        }
        if (channelUser) {
            throw new common_1.HttpException('user_already_member', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.channelsService.checkChannelPassword(channel.password, wanted_channel.password);
        if (is_invited) {
            wanted_channel.invited_members.splice(wanted_channel.invited_members.indexOf(is_invited), 1);
            await this.channelsService.saveChannel(wanted_channel);
        }
        await this.channelUsersService.createChannelUser({ channel: wanted_channel, user, role: channelUser_entity_1.ChannelUserRole.USER });
        return (this.channelsService.getChannelById(wanted_channel.id));
    }
    async leaveChannel(channel, user) {
        const wanted_channel = await this.channelsService.getChannelById(channel.id);
        if (wanted_channel.status === channel_entity_1.ChannelStatus.DIRECT_MESSAGE) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
        }
        const channel_user = wanted_channel.channelUsers.find(channelUser => channelUser.user.id === user.id);
        if (!channel_user) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
        }
        await this.channelUsersService.deleteChannelUser(channel_user.id);
    }
    async manageInvitation(invitationData, user) {
        const invited_user = await this.usersService.getById(invitationData.invitedId);
        let channel = await this.channelsService.getChannelById(invitationData.channelId);
        if (channel.status === channel_entity_1.ChannelStatus.DIRECT_MESSAGE) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
        }
        let invitation = channel.invited_members.find(member => member.id === user.id);
        if (user.id === invited_user.id) {
            if (invitation) {
                channel.invited_members.splice(channel.invited_members.indexOf(invitation), 1);
            }
            else {
                throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
            }
        }
        else {
            const channelUser = channel.channelUsers.find(channelUser => channelUser.user.id === user.id);
            if (!(channelUser) || await this.isUserBannedFromChannel(channelUser)) {
                throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
            }
            else if (!invitation) {
                channel.invited_members.push(invited_user);
            }
        }
        const updated_channel = await this.channelsService.saveChannel(channel);
        return await (await this.usersService.getById(invited_user.id)).invited_channels;
        ;
    }
    async updateChannelUser(channelUserData, user) {
        const affectedChannelUser = await this.channelUsersService.getChannelUserById(channelUserData.id);
        const channel = await this.channelsService.getChannelById(affectedChannelUser.channel.id);
        if (channel.status === channel_entity_1.ChannelStatus.DIRECT_MESSAGE) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
        }
        const channelApplicant = user.userChannels.find(userChannel => userChannel.channel.id === affectedChannelUser.channel.id);
        if (channelUserData.role) {
            if (!channelApplicant || channelApplicant.role !== channelUser_entity_1.ChannelUserRole.OWNER) {
                throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
            }
        }
        if (channelUserData.sanction) {
            if (affectedChannelUser.user.id === channelApplicant.user.id || channelApplicant.sanction ||
                !channelApplicant || channelApplicant.role === channelUser_entity_1.ChannelUserRole.USER ||
                (channelApplicant.role > channelUser_entity_1.ChannelUserRole.USER && channelApplicant.role < affectedChannelUser.role)) {
                throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
            }
        }
        return await this.channelUsersService.updateChannelUser(affectedChannelUser.id, channelUserData);
    }
    async saveChannelMessage(messageData, author) {
        const message_channel = await this.channelsService.getChannelById(messageData.channelId);
        if (message_channel.status === channel_entity_1.ChannelStatus.DIRECT_MESSAGE) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(author.id);
        }
        const channelUser = await message_channel.channelUsers.find(channelUser => channelUser.user.id === author.id);
        if (!(channelUser)) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(author.id);
        }
        if (channelUser.sanction) {
            if (channelUser.end_of_sanction && channelUser.end_of_sanction.getTime() <= new Date().getTime()) {
                console.log('sanction ended');
                this.channelUsersService.updateChannelUser(channelUser.id, Object.assign(Object.assign({}, channelUser), { sanction: null, end_of_sanction: null }));
            }
            else {
                throw new userUnauthorized_exception_1.UserUnauthorizedException(author.id);
            }
        }
        const newMessage = await this.messagesService.saveMessage(messageData, author, message_channel);
        return newMessage;
    }
    async createDirectMessagesChannel(applicant, recipient) {
        let channelData;
        channelData = Object.assign(Object.assign({}, channelData), { status: channel_entity_1.ChannelStatus.DIRECT_MESSAGE });
        const channel = await this.channelsService.createChannel(channelData);
        let channelUserData = {
            user: applicant,
            role: channelUser_entity_1.ChannelUserRole.USER,
            channel
        };
        await this.channelUsersService.createChannelUser(channelUserData);
        channelUserData.user = recipient;
        await this.channelUsersService.createChannelUser(channelUserData);
        return await this.channelsService.getChannelById(channel.id);
    }
    async getDirectMessagesChannel(applicant, recipient) {
        let channelUser = await applicant.userChannels.find(userChannel => {
            if (userChannel.channel.status === channel_entity_1.ChannelStatus.DIRECT_MESSAGE &&
                recipient.userChannels.find(recipChannel => recipChannel.channel.id === userChannel.channel.id)) {
                return userChannel;
            }
        });
        if (!channelUser) {
            return await this.createDirectMessagesChannel(applicant, recipient);
        }
        return await this.channelsService.getChannelById(channelUser.channel.id);
    }
    async saveDirectMessage(directMessageData, author) {
        let channel;
        if (directMessageData.channelId) {
            channel = await this.channelsService.getChannelById(directMessageData.channelId);
            if (channel.status !== channel_entity_1.ChannelStatus.DIRECT_MESSAGE || !channel.channelUsers.find(userChannel => userChannel.user.id === author.id)) {
                throw new userUnauthorized_exception_1.UserUnauthorizedException(author.id);
            }
        }
        else {
            const recipient = await this.usersService.getById(directMessageData.recipientId);
            channel = await this.getDirectMessagesChannel(author, recipient);
        }
        if (channel.status !== channel_entity_1.ChannelStatus.DIRECT_MESSAGE) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(author.id);
        }
        return await this.messagesService.saveMessage(directMessageData, author, channel);
    }
    async manageBlockedUsers(to_be_blocked, user) {
        const target = await this.usersService.getById(to_be_blocked.id);
        if (target.id === user.id) {
            throw new userUnauthorized_exception_1.UserUnauthorizedException(user.id);
        }
        if (user.blocked_users.find(blocked => blocked.id === target.id)) {
            user.blocked_users.splice(user.blocked_users.indexOf(target), 1);
        }
        else {
            user.blocked_users.splice(0, 0, target);
        }
        return await (await this.usersService.saveUser(user)).blocked_users;
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [authentication_service_1.AuthenticationService,
        channels_service_1.ChannelsService,
        users_service_1.UsersService,
        channelUser_service_1.ChannelUsersService,
        messages_service_1.MessagesService])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map