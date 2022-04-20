import { Exclude } from "class-transformer";
import LocalFile from "src/local-files/local-file.entity";
import Message from "src/chat/entities/message.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Channel from "src/chat/entities/channel.entity";
import ChannelUser from "src/chat/entities/channelUser.entity";

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
    public messages: Message[];
}

export default User;