"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUnauthorizedException = void 0;
const common_1 = require("@nestjs/common");
class UserUnauthorizedException extends common_1.UnauthorizedException {
    constructor(userId) {
        super(`User with id ${userId} unauthorized`);
    }
}
exports.UserUnauthorizedException = UserUnauthorizedException;
//# sourceMappingURL=userUnauthorized.exception.js.map