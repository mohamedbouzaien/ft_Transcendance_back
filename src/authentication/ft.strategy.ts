import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-42";
import User from "src/users/user.entity";
import { UsersService } from "src/users/users.service";
import { AuthenticationService } from "./authentication.service";

@Injectable()
export class ftStrategy extends PassportStrategy(Strategy)
{
    constructor(
        private readonly configService: ConfigService,
        private readonly authenticationService: AuthenticationService,
        private readonly userService:  UsersService
    ) {
        super({
            clientID: configService.get('FT_AUTH_CLIENT_ID'),
            clientSecret: configService.get('FT_AUTH_CLIENT_SECRET'),
            callbackURL: configService.get('FT_CALLBACK_URL')
        });
    }

    async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile
    ) {
        const userData = {
            username: profile.username,
            email: profile.emails[0].value,
            password: undefined,
            intra_id: profile.id,
        }
        let user: User = await this.userService.getByIntraId(userData.intra_id);
        if (user)
            return user;
        user = new User();
        user.username = userData.username;
        user.email = userData.email;
        user.intra_id = userData.intra_id;
        return user;
    }
}