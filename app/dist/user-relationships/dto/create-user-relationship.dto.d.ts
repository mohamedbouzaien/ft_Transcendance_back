import User from "src/users/user.entity";
import { UserRelationshipStatus } from "../user-relationship-status.enum";
export declare class CreateUserRelationshipDto {
    issuer: User;
    receiver: User;
    status: UserRelationshipStatus;
}
