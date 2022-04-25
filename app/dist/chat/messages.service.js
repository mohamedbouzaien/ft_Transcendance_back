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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const authentication_service_1 = require("../authentication/authentication.service");
const typeorm_2 = require("typeorm");
const channels_service_1 = require("./channels.service");
const message_entity_1 = require("./entities/message.entity");
let MessagesService = class MessagesService {
    constructor(authenticationService, messagesRepository, channelsService) {
        this.authenticationService = authenticationService;
        this.messagesRepository = messagesRepository;
        this.channelsService = channelsService;
    }
    async saveMessage(messageData) {
        const newMessage = await this.messagesRepository.create(messageData);
        await this.messagesRepository.save(newMessage);
        return newMessage;
    }
    async getAllMessages() {
        return (this.messagesRepository.find({
            relations: ['author', 'channel']
        }));
    }
    async getMessageById(id) {
        return await this.messagesRepository.findOne(id, { relations: ['author', 'channel'] });
    }
};
MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.default)),
    __metadata("design:paramtypes", [authentication_service_1.AuthenticationService,
        typeorm_2.Repository,
        channels_service_1.ChannelsService])
], MessagesService);
exports.MessagesService = MessagesService;
//# sourceMappingURL=messages.service.js.map