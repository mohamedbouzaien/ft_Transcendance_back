import RequestWithUser from 'src/authentication/request-with-user.interface';
import { UsersService } from 'src/users/users.service';
import { UpdateUserRelationshipStatusDto } from './dto/update-user-relationship-status.dto';
import { UserRelationshipsService } from './user-relationships.service';
export declare class UserRelationshipsController {
    private readonly userRelationshipsService;
    private readonly usersService;
    constructor(userRelationshipsService: UserRelationshipsService, usersService: UsersService);
    createRelationship(id: number, request: RequestWithUser): Promise<import("./user-relationship.entity").default>;
    updateStatus(request: RequestWithUser, { id, status }: UpdateUserRelationshipStatusDto): Promise<import("./user-relationship.entity").default>;
    deleteRelationship(id: number, request: RequestWithUser): Promise<import("typeorm").DeleteResult>;
}
