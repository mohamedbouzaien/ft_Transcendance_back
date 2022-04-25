import { UsersService } from 'src/users/users.service';
import RegisterDto from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class AuthenticationService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    register(registrationData: RegisterDto): Promise<import("../users/user.entity").default>;
    getAuthenticatedUser(username: string, hashedPassword: string): Promise<import("../users/user.entity").default>;
    private verifyPassword;
    getCookieWithJwtAccessToken(userId: number, isSecondFactorAuthenticated?: boolean): string;
    getCookieWithJwtRefreshToken(userId: number): {
        cookie: string;
        token: string;
    };
    getCookiesForLogOut(): string[];
}
