import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import User from "src/users/user.entity";
import { Repository } from "typeorm";
import CreateGameDto from "../dto/createGame.dto";
import Game, { EndGameStatus } from "../entities/game.entity";
import { GameNotFoundException } from "../exception/GameNotFound.exception";
import GameObject from "../objects/game.object";

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepository: Repository<Game>
  ) {}

  async getGameById(id: number) {
    const game = this.gamesRepository.findOne(id);
    if (!game)
      throw new GameNotFoundException(id.toString());
    return (game);
  }

  async getAllUserGames(user: User) {
    return await this.gamesRepository.find({
      where: [
        {player1: user},
        {player2: user}],
    })
  }

  async createGame(gameData: GameObject) {
    let newGameData: CreateGameDto = {
      player1: gameData.player1.user,
      player2: gameData.player2.user,
      player1Points: gameData.player1.score,
      player2Points: gameData.player2.score,
      pointsTarget: gameData.maxPoints,
      ballSpeed: gameData.ballSpeed,
      playersSize: gameData.playerHeight
    };
    if (gameData.player1.isReady == false && gameData.player2.isReady == false) {
      newGameData.endGameStatus = EndGameStatus.ABORT;
      newGameData.player1Points = 0;
      newGameData.player2Points = 0;
    }

    const newGame = await this.gamesRepository.create({
      ...newGameData,
    });
    await this.gamesRepository.save(newGame);
    return newGame;
  }

  async deleteDuel(id: number) {
    const deletedGame = await this.gamesRepository.delete(id);
    if (!deletedGame.affected) {
      throw new GameNotFoundException(id.toString());
    }
    return deletedGame;
  }
}