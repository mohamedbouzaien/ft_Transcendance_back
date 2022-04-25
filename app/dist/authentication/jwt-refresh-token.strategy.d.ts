import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import TokenPayload from "./token-payload.interface";
declare const JwtRefreshTokenStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtRefreshTokenStrategy extends JwtRefreshTokenStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(request: Request, payload: TokenPayload): Promise<import("../users/user.entity").default>;
}
export {};
