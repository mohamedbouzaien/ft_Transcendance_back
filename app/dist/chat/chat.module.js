"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const authentication_module_1 = require("../authentication/authentication.module");
const messages_service_1 = require("./services/messages.service");
const users_module_1 = require("../users/users.module");
const channels_service_1 = require("./services/channels.service");
const channelUser_service_1 = require("./services/channelUser.service");
const chat_gateway_1 = require("./chat.gateway");
const chat_service_1 = require("./services/chat.service");
const channel_entity_1 = require("./entities/channel.entity");
const channelUser_entity_1 = require("./entities/channelUser.entity");
const message_entity_1 = require("./entities/message.entity");
const channels_controller_1 = require("./controllers/channels.controller");
let ChatModule = class ChatModule {
};
ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([channel_entity_1.default]),
            typeorm_1.TypeOrmModule.forFeature([message_entity_1.default]),
            typeorm_1.TypeOrmModule.forFeature([channelUser_entity_1.default]),
            authentication_module_1.AuthenticationModule,
            users_module_1.UsersModule
        ],
        controllers: [channels_controller_1.ChannelsController],
        providers: [chat_gateway_1.ChatGateway, chat_service_1.ChatService, channels_service_1.ChannelsService, messages_service_1.MessagesService, channelUser_service_1.ChannelUsersService],
    })
], ChatModule);
exports.ChatModule = ChatModule;
;
//# sourceMappingURL=chat.module.js.map