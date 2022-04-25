"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ftStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_42_1 = require("passport-42");
const users_service_1 = require("../users/users.service");
const authentication_service_1 = require("./authentication.service");
let ftStrategy = class ftStrategy extends (0, passport_1.PassportStrategy)(passport_42_1.Strategy) {
    constructor(configService, authenticationService, userService) {
        super({
            clientID: configService.get('FT_AUTH_CLIENT_ID'),
            clientSecret: configService.get('FT_AUTH_CLIENT_SECRET'),
            callbackURL: configService.get('FT_CALLBACK_URL')
        });
        this.configService = configService;
        this.authenticationService = authenticationService;
        this.userService = userService;
    }
    async validate(_accessToken, _refreshToken, profile) {
        const userData = {
            username: profile.username,
            email: profile.emails[0].value,
            password: '0000',
            intra_id: profile.id
        };
        const user = await this.userService.getByIntraId(userData.intra_id);
        if (user)
            return user;
        return this.authenticationService.register(userData);
    }
};
ftStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        authentication_service_1.AuthenticationService,
        users_service_1.UsersService])
], ftStrategy);
exports.ftStrategy = ftStrategy;
//# sourceMappingURL=ft.strategy.js.map