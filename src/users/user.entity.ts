import { Exclude } from "class-transformer";
import LocalFile from "src/local-files/local-file.entity";
import UserRelationship from "src/user-relationships/user-relationship.entity"
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class User {
    @PrimaryGeneratedColumn()
    public id?: number;
    @Column({unique: true})
    public email: string;
    @Column()
    public name: string;
    @Column()
    public password: string;
    @Column({ nullable: true})
    @Exclude()
    public currentHashedRefreshToken?: string;
    @Column({nullable: true, unique: true})
    public intraId: string;
    @Column({nullable: true})
    public twoFactorAuthenticationSecret?: string;
    @Column({default: false})
    public isTwoFactorAuthenticationEnabled: boolean;
    @JoinColumn({name: 'avatarId'})
    @OneToOne(() => LocalFile,
    {
        nullable: true
    })
    public avatar?: LocalFile;
    @Column({nullable: true})
    public avatarId?: number;

    @OneToMany(() => UserRelationship, (userRelationship: UserRelationship) =>userRelationship.first_user)
    public relationships_first: UserRelationship[];

    @OneToMany(() => UserRelationship, (userRelationship: UserRelationship) =>userRelationship.second_user)
    public relationships_second: UserRelationship[];
}

export default User;