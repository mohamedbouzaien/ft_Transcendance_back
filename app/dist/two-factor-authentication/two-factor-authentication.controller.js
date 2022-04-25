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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorAuthenticationController = void 0;
const common_1 = require("@nestjs/common");
const authentication_service_1 = require("../authentication/authentication.service");
const jwt_authentication_guard_1 = require("../authentication/jwt-authentication.guard");
const users_service_1 = require("../users/users.service");
const two_factor_authentication_code_dto_1 = require("./dto/two-factor-authentication-code.dto");
const two_factor_authentication_service_1 = require("./two-factor-authentication.service");
let TwoFactorAuthenticationController = class TwoFactorAuthenticationController {
    constructor(twoFactorAuthenticationService, usersService, authenticationService) {
        this.twoFactorAuthenticationService = twoFactorAuthenticationService;
        this.usersService = usersService;
        this.authenticationService = authenticationService;
    }
    async register(response, request) {
        const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user);
        return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
    }
    async turnOnTwoFactorAuthentication(request, { twoFactorAuthenticationCode }) {
        const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, request.user);
        if (!isCodeValid) {
            throw new common_1.UnauthorizedException('Wrong authentication code');
        }
        await this.usersService.setIsTwoFactorAuthenticationIsEnabled(true, request.user.id);
    }
    async authenticate(request, { twoFactorAuthenticationCode }) {
        const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, request.user);
        if (!isCodeValid) {
            throw new common_1.UnauthorizedException('Wrong authentication code');
        }
        const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true);
        request.res.setHeader('Set-Cookie', [accessTokenCookie]);
        return request.user;
    }
};
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.UseGuards)(jwt_authentication_guard_1.default),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthenticationController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('turn-on'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_authentication_guard_1.default),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, two_factor_authentication_code_dto_1.default]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthenticationController.prototype, "turnOnTwoFactorAuthentication", null);
__decorate([
    (0, common_1.Post)('authenticate'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_authentication_guard_1.default),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, two_factor_authentication_code_dto_1.default]),
    __metadata("design:returntype", Promise)
], TwoFactorAuthenticationController.prototype, "authenticate", null);
TwoFactorAuthenticationController = __decorate([
    (0, common_1.Controller)('two-factor-authentication'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [two_factor_authentication_service_1.TwoFactorAuthenticationService,
        users_service_1.UsersService,
        authentication_service_1.AuthenticationService])
], TwoFactorAuthenticationController);
exports.TwoFactorAuthenticationController = TwoFactorAuthenticationController;
//# sourceMappingURL=two-factor-authentication.controller.js.map