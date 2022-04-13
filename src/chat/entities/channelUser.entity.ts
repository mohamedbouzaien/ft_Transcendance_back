import User from "src/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Channel from "./channel.entity";

export enum ChannelUserRole {
  OWNER = 3,
  ADMIN = 2,
  USER = 1
}

@Entity()
class ChannelUser {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({
    type: 'enum',
    enum: ChannelUserRole,
    default: ChannelUserRole.USER
  })
  public role: ChannelUserRole;

  @ManyToOne(() => Channel, (channel: Channel) => channel.channelUsers, {cascade: true, eager: true})
  channel: Channel;

  @ManyToOne(() => User, (user: User) => user.userChannels, {eager: true})
  user: User;
}

export default ChannelUser;