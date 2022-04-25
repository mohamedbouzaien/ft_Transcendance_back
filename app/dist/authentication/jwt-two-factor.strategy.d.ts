import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import TokenPayload from "./token-payload.interface";
declare const JwtTwoFactorStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtTwoFactorStrategy extends JwtTwoFactorStrategy_base {
    private readonly configService;
    private readonly usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: TokenPayload): Promise<import("../users/user.entity").default>;
}
export {};
