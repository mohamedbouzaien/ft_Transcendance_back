import User from "src/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Channel from "./channel.entity";

export enum ChannelUserRole {
  OWNER = 3,
  ADMIN = 2,
  USER = 1
}

export enum SanctionType {
  MUTE = 'mute',
  BAN = 'ban',
  NONE = ''
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

  @Column({
    type: 'enum',
    enum: SanctionType,
    nullable: true
  })
  public sanction: SanctionType;

  @Column({ type: 'timestamptz', nullable: true })
  end_of_sanction: Date;

  @ManyToOne(() => Channel, (channel: Channel) => channel.channelUsers, {cascade: true, eager: true})
  channel: Channel;

  @ManyToOne(() => User, (user: User) => user.userChannels, {eager: true})
  user: User;
}

export default ChannelUser;