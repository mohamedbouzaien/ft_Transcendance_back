import { UnauthorizedException } from "@nestjs/common";
export declare class UserUnauthorizedException extends UnauthorizedException {
    constructor(userId: number);
}
