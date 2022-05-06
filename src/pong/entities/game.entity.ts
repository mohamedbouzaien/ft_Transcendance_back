import User from "src/users/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
class Game {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({default: '1'})
  public ballSpeed: number;

  @Column({default: '1'})
  public racketSize: number;

  @ManyToOne(() => User, (user: User) => user.games)
  user: User;

  @Column({default: '0'})
  public user1Points: number;

  @Column({default: '0'})
  public user2Points: number;
}

export default Game;