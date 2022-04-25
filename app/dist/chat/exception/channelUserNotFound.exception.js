"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelUserNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class ChannelUserNotFoundException extends common_1.NotFoundException {
    constructor(channelUserId) {
        super(`ChannelUser with id ${channelUserId} not found`);
    }
}
exports.ChannelUserNotFoundException = ChannelUserNotFoundException;
//# sourceMappingURL=channelUserNotFound.exception.js.map