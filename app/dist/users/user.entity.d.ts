import LocalFile from "src/local-files/local-file.entity";
import UserRelationship from "src/user-relationships/user-relationship.entity";
import { UserStatus } from "./user-status.enum";
declare class User {
    id?: number;
    email: string;
    username: string;
    password: string;
    currentHashedRefreshToken?: string;
    intra_id: string;
    twoFactorAuthenticationSecret?: string;
    isTwoFactorAuthenticationEnabled: boolean;
    avatar?: LocalFile;
    avatar_id?: number;
    status: UserStatus;
    sent_relationships: UserRelationship[];
    received_relationships: UserRelationship[];
    victories: number;
    defeats: number;
}
export default User;
