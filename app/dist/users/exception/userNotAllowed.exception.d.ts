import { UnauthorizedException } from "@nestjs/common";
export declare class UserNotAllowedException extends UnauthorizedException {
    constructor(userId: number);
}
