import User from "src/users/user.entity";
import { UserRelationshipStatus } from "./user-relationship-status.enum";
declare class UserRelationship {
    id: number;
    issuer_id: number;
    issuer: User;
    receiver_id: number;
    receiver: User;
    status: UserRelationshipStatus;
}
export default UserRelationship;
