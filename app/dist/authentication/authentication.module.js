"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const users_module_1 = require("../users/users.module");
const authentication_controller_1 = require("./authentication.controller");
const authentication_service_1 = require("./authentication.service");
const jwt_strategy_1 = require("./jwt.strategy");
const jwt_refresh_token_strategy_1 = require("./jwt-refresh-token.strategy");
const local_strategy_1 = require("./local.strategy");
const ft_strategy_1 = require("./ft.strategy");
const jwt_two_factor_strategy_1 = require("./jwt-two-factor.strategy");
let AuthenticationModule = class AuthenticationModule {
};
AuthenticationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            passport_1.PassportModule,
            config_1.ConfigModule,
            jwt_1.JwtModule.register({})
        ],
        providers: [authentication_service_1.AuthenticationService, local_strategy_1.LocalStrategy, jwt_strategy_1.JwtStrategy, jwt_refresh_token_strategy_1.JwtRefreshTokenStrategy, ft_strategy_1.ftStrategy, jwt_two_factor_strategy_1.JwtTwoFactorStrategy],
        controllers: [authentication_controller_1.AuthenticationController],
        exports: [authentication_service_1.AuthenticationService]
    })
], AuthenticationModule);
exports.AuthenticationModule = AuthenticationModule;
//# sourceMappingURL=authentication.module.js.map