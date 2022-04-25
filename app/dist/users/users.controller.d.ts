/// <reference types="multer" />
import RequestWithUser from 'src/authentication/request-with-user.interface';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    addAvatar(request: RequestWithUser, file: Express.Multer.File): Promise<void>;
}
