import { ConfigService } from '@nestjs/config';
import User from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';
export declare class TwoFactorAuthenticationService {
    private readonly usersService;
    private readonly configService;
    constructor(usersService: UsersService, configService: ConfigService);
    generateTwoFactorAuthenticationSecret(user: User): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    pipeQrCodeStream(stream: Response, otpauthUrl: string): Promise<any>;
    isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User): boolean;
}
