import { Transform } from "class-transformer";
import { IsEnum } from "class-validator";
import User from "src/users/user.entity";
import { UserRelationshipStatus } from "../user-relationship-status.enum";

export class UpdateUserRelationshipStatusDto {
    @Transform(({ value }) => parseInt(value))
    id: number;
    @IsEnum(UserRelationshipStatus)
    status: UserRelationshipStatus;
}