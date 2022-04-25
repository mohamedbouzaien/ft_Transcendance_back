import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "src/users/users.service";
import TokenPayload from "./token-payload.interface";

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
            return request?.cookies?.Refresh;
        }]),
            secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET'),
            passReqToCallBack: true
        });
    }

    async validate(request: Request, payload: TokenPayload) {
        const refreshToken = request.cookies?.refresh;
        return this.usersService.getUserIfRefreshTokenMatches(refreshToken, payload.userId);
    }
}
