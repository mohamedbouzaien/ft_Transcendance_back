import User from "src/users/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Channel from "./channel.entity";

@Entity()
class Message {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public content: string;

  @ManyToOne(() => User, (author: User) => author.messages)
  public author: User;

  @ManyToOne(() => Channel, (channel: Channel) => channel.messages)
  public channel: Channel;
}

export default Message