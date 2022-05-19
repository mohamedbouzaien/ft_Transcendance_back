import User from "src/users/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { GameBallSpeed, GameMaxPoints, GamePlayerHeight } from "../objects/game.object";

export enum EndGameStatus {
  FINISHED = 'finished',
  ABORT = 'abort'
}

@Entity()
class Game {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => User, (player1: User) => player1.gamesAsPlayer1, {eager: true})
  player1: User;

  @ManyToOne(() => User, (player1: User) => player1.gamesAsPlayer2, {eager: true})
  player2: User;

  @Column({default: 0})
  player1Points: number;
 
  @Column({default: 0})
  player2Points: number;

  @Column()
  pointsTarget: GameMaxPoints;

  @Column()
  playersSize: GamePlayerHeight;

  @Column()
  ballSpeed: GameBallSpeed;

  @Column({default: EndGameStatus.FINISHED})
  endGameStatus: EndGameStatus;
}

export default Game;