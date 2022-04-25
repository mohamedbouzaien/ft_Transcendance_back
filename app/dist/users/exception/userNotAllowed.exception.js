"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotAllowedException = void 0;
const common_1 = require("@nestjs/common");
class UserNotAllowedException extends common_1.UnauthorizedException {
    constructor(userId) {
        super(`User with id ${userId} unauthorized`);
    }
}
exports.UserNotAllowedException = UserNotAllowedException;
//# sourceMappingURL=userNotAllowed.exception.js.map