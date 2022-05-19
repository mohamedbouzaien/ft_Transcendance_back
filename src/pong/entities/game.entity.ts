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

  @Column({
    type: 'enum',
    enum: GameMaxPoints,
  })
  pointsTarget: GameMaxPoints;

  @Column({
    type: 'enum',
    enum: GamePlayerHeight,
  })
  playersSize: GamePlayerHeight;

  @Column({
    type: 'enum',
    enum: GameBallSpeed,
  })
  ballSpeed: GameBallSpeed;

  @Column({
    type: 'enum',
    enum: EndGameStatus,
    default: EndGameStatus.FINISHED
  })
  endGameStatus: EndGameStatus;
}

export default Game;