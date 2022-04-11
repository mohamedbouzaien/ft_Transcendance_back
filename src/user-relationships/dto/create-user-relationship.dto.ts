import { IsEnum } from "class-validator";
import User from "src/users/user.entity";
import { UserRelationshipStatus } from "../user-relationship-status.enum";

export class CreateUserRelationshipDto {
    issuer: User;
    receiver: User;
    @IsEnum(UserRelationshipStatus)
    status: UserRelationshipStatus;
}
