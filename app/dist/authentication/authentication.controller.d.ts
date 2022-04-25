import { UsersService } from 'src/users/users.service';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './request-with-user.interface';
export declare class AuthenticationController {
    private readonly authenticationService;
    private readonly usersService;
    constructor(authenticationService: AuthenticationService, usersService: UsersService);
    register(registrationData: RegisterDto): Promise<import("../users/user.entity").default>;
    login(request: RequestWithUser): Promise<import("../users/user.entity").default>;
    loginWith42(): void;
    refresh(request: RequestWithUser): import("../users/user.entity").default;
    logOut(request: RequestWithUser): Promise<void>;
    authenticate(request: RequestWithUser): import("../users/user.entity").default;
    ftCallback(request: RequestWithUser): Promise<import("../users/user.entity").default>;
}
