"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelNotFoundException = void 0;
const common_1 = require("@nestjs/common");
class ChannelNotFoundException extends common_1.NotFoundException {
    constructor(channelId) {
        super(`Channel with id ${channelId} not found`);
    }
}
exports.ChannelNotFoundException = ChannelNotFoundException;
//# sourceMappingURL=channelNotFound.exception%20copy.js.map