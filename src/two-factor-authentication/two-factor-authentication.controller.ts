import { ClassSerializerInterceptor, Controller, Post, UseGuards, UseInterceptors, Res, Req, Get, HttpCode, Body, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from 'src/authentication/authentication.service';
import JwtAuthenticationGuard from 'src/authentication/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/request-with-user.interface';
import { UsersService } from 'src/users/users.service';
import twoFactorAuthenticationCodeDto from './dto/two-factor-authentication-code.dto';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';

@Controller('two-factor-authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
    constructor(
        private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
        private readonly usersService: UsersService,
        private readonly authenticationService: AuthenticationService
    ){}

    @Post('generate')
    @UseGuards(JwtAuthenticationGuard)
    async register(@Res() response:Response, @Req() request: RequestWithUser) {
        const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user);
        return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
    }

    @Post('turn-on')
    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    async turnOnTwoFactorAuthentication(@Req() request: RequestWithUser, @Body() {twoFactorAuthenticationCode} : twoFactorAuthenticationCodeDto)
    {
        console.log(request);
        const isCodeValid= this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, request.user);
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }
        await this.usersService.setIsTwoFactorAuthenticationIsEnabled(true, request.user.id);
    }

    @Post('authenticate')
    @HttpCode(200)
    @UseGuards(JwtAuthenticationGuard)
    async authenticate(@Req() request: RequestWithUser, @Body() { twoFactorAuthenticationCode} : twoFactorAuthenticationCodeDto) {
        const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode, request.user);
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }
        const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true);
        request.res.setHeader('Set-Cookie', [accessTokenCookie]);
        return request.user;
    }
}
