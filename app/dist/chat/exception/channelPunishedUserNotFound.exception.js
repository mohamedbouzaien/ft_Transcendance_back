"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelPunishedUserNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class ChannelPunishedUserNotFoundException extends common_1.NotFoundException {
    constructor(channelPunishedUser) {
        super(`ChannelPunishedUser with id ${channelPunishedUser} not found`);
    }
}
exports.ChannelPunishedUserNotFoundException = ChannelPunishedUserNotFoundException;
//# sourceMappingURL=channelPunishedUserNotFound.exception.js.map