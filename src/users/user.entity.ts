import { Exclude } from "class-transformer";
import LocalFile from "src/local-files/local-file.entity";
import UserRelationship from "src/user-relationships/user-relationship.entity"
import { Column, Entity, JoinColumn, JoinTable, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserStatus } from "./user-status.enum";

@Entity()
class User {
    @PrimaryGeneratedColumn()
    public id?: number;
    @Column({unique: true})
    public email: string;
    @Column({unique: true})
    public username: string;
    @Column()
    public password: string;
    @Column({ nullable: true})
    @Exclude()
    public currentHashedRefreshToken?: string;
    @Column({nullable: true})
    @Exclude()
    public intra_id: string;
    @Column({nullable: true})
    public twoFactorAuthenticationSecret?: string;
    @Column({default: false})
    public isTwoFactorAuthenticationEnabled: boolean;
    @JoinColumn({name: 'avatar_id'})
    @OneToOne(() => LocalFile,
    {
        nullable: true
    })
    public avatar?: LocalFile;
    @Column({nullable: true})
    public avatar_id?: number;

    @Column({
        type: "enum",
        enum: UserStatus,
        default: UserStatus.OFFLINE
    })
    public status: UserStatus;

    @OneToMany(() => UserRelationship, (userRelationship: UserRelationship) =>userRelationship.issuer)
    public sent_relationships: UserRelationship[];

    @OneToMany(() => UserRelationship, (userRelationship: UserRelationship) =>userRelationship.receiver)
    @JoinTable()
    public received_relationships: UserRelationship[];

    @Column({default: 0})
    public victories: number;
    
    @Column({default: 0})
    public defeats: number;
}

export default User;