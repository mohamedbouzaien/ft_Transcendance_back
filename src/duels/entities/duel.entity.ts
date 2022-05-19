import User from "src/users/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Duel {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(()=> User, (user: User) => user.sendedDuels)
  sender: User;
  @ManyToOne(()=> User, (user: User) => user.receivedDuels)
  receiver: User;
}