import { Exclude, Transform } from "class-transformer";
import User from "src/users/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import ChannelUser from "./channelUser.entity";
import Message from "./message.entity";

export enum ChannelStatus {
  PRIVATE = 'private',
  PUBLIC = 'public',
  PROTECTED = 'protected',
  DIRECT_MESSAGE = 'direct_message'
}

@Entity()
class Channel {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({nullable: true})
  public name: string;

  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.PUBLIC
  })
  public status: ChannelStatus;

  @Column({nullable: true})
  @Exclude()
  public password: string;

  @OneToMany(() => ChannelUser, (channelUser: ChannelUser) => channelUser.channel, {cascade: true})
  channelUsers: ChannelUser[];

  @ManyToMany(() => User, (invited_member: User) => invited_member.invited_channels, {cascade: true})
  @JoinTable()
  public invited_members: User[];
  
  @OneToMany(() => Message, (message: Message) => message.channel)
  public messages: Message[];
}

export default Channel;