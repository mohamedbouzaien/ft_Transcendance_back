import User from "src/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";

export enum RelashionshipStatus {
    PENDING_FIRST_SECOND,
    PENDING_SECOND_FIRST,
    FRIENDS,
    BLOCK_FIRST_SECOND,
    BLOCK_SECOND_FIRST,
    BLOCK_BOTH
}

@Entity()
class UserRelationship {

    @PrimaryColumn()
    public first_user_id: number;
    @ManyToOne(()=> User, (first_user: User) => first_user.relationships_first)
    public first_user: User;
    @PrimaryColumn()
    public second_user_id: number;
    @ManyToOne(()=> User, (second_user: User) => second_user.relationships_second)
    public second_user: User;
    @Column({
        type: "enum",
        enum: RelashionshipStatus,
        default: RelashionshipStatus.PENDING_FIRST_SECOND
    })
    public status: RelashionshipStatus;
}

export default UserRelationship;