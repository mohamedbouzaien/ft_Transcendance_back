import { Response } from 'express';
import { AuthenticationService } from 'src/authentication/authentication.service';
import RequestWithUser from 'src/authentication/request-with-user.interface';
import { UsersService } from 'src/users/users.service';
import twoFactorAuthenticationCodeDto from './dto/two-factor-authentication-code.dto';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
export declare class TwoFactorAuthenticationController {
    private readonly twoFactorAuthenticationService;
    private readonly usersService;
    private readonly authenticationService;
    constructor(twoFactorAuthenticationService: TwoFactorAuthenticationService, usersService: UsersService, authenticationService: AuthenticationService);
    register(response: Response, request: RequestWithUser): Promise<any>;
    turnOnTwoFactorAuthentication(request: RequestWithUser, { twoFactorAuthenticationCode }: twoFactorAuthenticationCodeDto): Promise<void>;
    authenticate(request: RequestWithUser, { twoFactorAuthenticationCode }: twoFactorAuthenticationCodeDto): Promise<import("../users/user.entity").default>;
}
