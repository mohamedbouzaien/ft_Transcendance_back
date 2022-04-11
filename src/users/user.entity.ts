import { Exclude } from "class-transformer";
import LocalFile from "src/local-files/local-file.entity";
import Message from "src/chat/entities/message.entity";
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Channel from "src/chat/entities/channel.entity";
import { channel } from "diagnostics_channel";

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

    @OneToMany(() => Channel, (owned_channel: Channel) => owned_channel.owner)
    public owned_channels: Channel[];

    @ManyToMany(() => Channel, (channel: Channel) => channel.members)
    public channels: Channel[];

    @ManyToMany(() => Channel, (invited_channel: Channel) => invited_channel.invited_members)
    public invited_channels: Channel[];

    @OneToMany(() => Message, (message: Message) => message.author)
    public messages: Message[];
}

export default User;