import { Strategy } from "passport-local";
import User from "src/users/user.entity";
import { AuthenticationService } from "./authentication.service";
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private authenticationService;
    constructor(authenticationService: AuthenticationService);
    validate(username: string, password: string): Promise<User>;
}
export {};
