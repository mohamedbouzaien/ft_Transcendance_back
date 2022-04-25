import User from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserRelationshipStatus } from "./user-relationship-status.enum";

@Entity()
class UserRelationship {

    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public issuer_id: number;

    @ManyToOne(()=> User, (issuer: User) => issuer.sent_relationships)
    @JoinColumn({name: 'issuer_id'})
    public issuer: User;

    @Column()
    public receiver_id: number;

    @ManyToOne(()=> User, (receiver: User) => receiver.received_relationships)
    @JoinColumn({name: 'receiver_id'})
    public receiver: User;
    @Column({
        type: "enum",
        enum: UserRelationshipStatus,
        default: UserRelationshipStatus.PENDING
    })
    public status: UserRelationshipStatus;
}

export default UserRelationship;
