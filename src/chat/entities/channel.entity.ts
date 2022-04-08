import User from "src/users/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Message from "./message.entity";

export enum ChannelStatus {
  PRIVATE = 'private',
  PUBLIC = 'public',
  DIRECT_MESSAGE = 'direct_message'
}

@Entity()
class Channel {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({
    type: 'enum',
    enum: ChannelStatus,
    default: ChannelStatus.PUBLIC
  })
  public status: ChannelStatus;

  @Column()
  public password: string;

  @ManyToOne(() => User, (owner: User) => owner.owned_channels, {onDelete: 'CASCADE'})
  public owner: User;

  @Column("int", {array: true, nullable: true})
  admins_id: number[];

  @ManyToMany(() => User, (member: User) => member.channels)
  @JoinTable()
  public members: User[];

  @OneToMany(() => Message, (message: Message) => message.channel)
  public messages: Message[];
}

export default Channel;