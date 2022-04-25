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
exports.ChannelUsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const channelUser_entity_1 = require("./entities/channelUser.entity");
const channelUserNotFound_exception_1 = require("./exception/channelUserNotFound.exception");
let ChannelUsersService = class ChannelUsersService {
    constructor(channelUsersRepository) {
        this.channelUsersRepository = channelUsersRepository;
    }
    async getChannelUserById(id) {
        const channelUser = this.channelUsersRepository.findOne(id, { relations: ['user', 'channel'] });
        if (!channelUser) {
            throw new channelUserNotFound_exception_1.ChannelUserNotFoundException(id);
        }
        return (channelUser);
    }
    async createChannelUser(channelUserData) {
        const newChannelUser = await this.channelUsersRepository.create(Object.assign({}, channelUserData));
        await this.channelUsersRepository.save(newChannelUser);
        return newChannelUser;
    }
    async updateChannelUser(id, channelUserData) {
        await this.channelUsersRepository.update(id, channelUserData);
        const updatedChannelUser = await this.getChannelUserById(id);
        if (!updatedChannelUser) {
            throw new channelUserNotFound_exception_1.ChannelUserNotFoundException(id);
        }
        return updatedChannelUser;
    }
    async deleteChannelUser(id) {
        const delete_channel = await this.channelUsersRepository.delete(id);
        if (delete_channel.affected) {
            throw new channelUserNotFound_exception_1.ChannelUserNotFoundException(id);
        }
    }
};
ChannelUsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(channelUser_entity_1.default)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ChannelUsersService);
exports.ChannelUsersService = ChannelUsersService;
//# sourceMappingURL=channelUser.service.js.map