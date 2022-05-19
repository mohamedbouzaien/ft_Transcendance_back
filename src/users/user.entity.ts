import { Exclude } from "class-transformer";
import LocalFile from "src/local-files/local-file.entity";
import Message from "src/chat/entities/message.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Channel from "src/chat/entities/channel.entity";
import ChannelUser from "src/chat/entities/channelUser.entity";
import UserRelationship from "src/user-relationships/user-relationship.entity"
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
    @Exclude()
    public password: string;
    @Column({ nullable: true})
    @Exclude()
    public currentHashedRefreshToken?: string;
    @Column({nullable: true})
    @Exclude()
    public intra_id: string;
    @Column({nullable: true})
    @Exclude()
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

    @ManyToMany(() => User, (blocked_user: User) => blocked_user.blocked_by_users)
    @JoinTable()
    public blocked_users: User[];

    @ManyToMany(() => User, (blocked_by_user: User) => blocked_by_user.blocked_users)
    public blocked_by_users: User[];

    @OneToMany(() => ChannelUser, (channelUser: ChannelUser) => channelUser.user)
    public userChannels: ChannelUser[];

    @ManyToMany(() => Channel, (invited_channel: Channel) => invited_channel.invited_members)
    public invited_channels: Channel[];

    @OneToMany(() => Message, (message: Message) => message.author)
    @Exclude()
    public messages: Message[];

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