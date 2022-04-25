import { ConfigService } from "@nestjs/config";
import { Profile } from "passport-42";
import User from "src/users/user.entity";
import { UsersService } from "src/users/users.service";
import { AuthenticationService } from "./authentication.service";
declare const ftStrategy_base: new (...args: any[]) => any;
export declare class ftStrategy extends ftStrategy_base {
    private readonly configService;
    private readonly authenticationService;
    private readonly userService;
    constructor(configService: ConfigService, authenticationService: AuthenticationService, userService: UsersService);
    validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<User>;
}
export {};
