import { Body, Controller, HttpCode, Post, Req, Res, UseGuards, Response, Get, Redirect, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UserStatus } from 'src/users/user-status.enum';
import { UsersService } from 'src/users/users.service';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import { FtAuthenticationGuard } from './ft-authentication.guard';
import JwtAuthenticationGuard from './jwt-authentication.guard';
import JwtRefreshGuard from './jwt-refresh.guard';
import { LocalAuthenticationGuard } from './local-authentication.guard';
import RequestWithUser from './request-with-user.interface';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly usersService: UsersService
    ) {}

    @Post('register')
    async register(@Body() registrationData: RegisterDto) {
        return this.authenticationService.register(registrationData);
    }
    
    @HttpCode(200)
    @UseGuards(LocalAuthenticationGuard)
    @Post('log-in')
    async login(@Req() request: RequestWithUser) {
        const {user} = request;
        const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(user.id);
        const {
            cookie: refreshTokenCookie,
            token: refreshToken
        } = this.authenticationService.getCookieWithJwtRefreshToken(user.id);
        await this.usersService.setCurrentRefreshToken(refreshToken, user.id);
        await this.usersService.setStatus(UserStatus.ONLINE, user.id);
        request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
        if (user.isTwoFactorAuthenticationEnabled) {
            return;
        }
        return user;
    }

    @UseGuards(FtAuthenticationGuard)
    @Get('log-in')
    loginWith42() {
      
    }

    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    async refresh(@Req() request: RequestWithUser) {
        const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id);
        const user = await this.usersService.setStatus(UserStatus.ONLINE, request.user.id);
        request.res.setHeader('Set-Cookie', accessTokenCookie);
        return request.user;
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('log-out')
    @HttpCode(200)
    async logOut(@Req() request: RequestWithUser) {
        await this.usersService.setStatus(UserStatus.OFFLINE, request.user.id);
        await this.usersService.removeRefreshToken(request.user.id);
        request.res.setHeader('Set-Cookie', this.authenticationService.getCookiesForLogOut());
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
      const user = request.user;
      user.password = undefined;
      return user;
    }

    @UseGuards(FtAuthenticationGuard)
    @Redirect(process.env.FRONT_URL)
    @Get('callback')
    async ftCallback(@Req() request: RequestWithUser) {
        const {user} = request;
        const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(user.id);
        const {
            cookie: refreshTokenCookie,
            token: refreshToken
        } = this.authenticationService.getCookieWithJwtRefreshToken(user.id);
        await this.usersService.setCurrentRefreshToken(refreshToken, user.id);
        request.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
        return user;
    }
}
