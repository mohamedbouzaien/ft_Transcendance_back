import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "src/users/users.service";
import { Repository } from "typeorm";
import CreateGameDto from "../dto/createGame.dto";
import Game from "../entities/game.entity";
import { GameNotFoundException } from "../exception/GameNotFound.exception";

 @Injectable()
 export class GamesService {
   constructor (
     private readonly usersService: UsersService,
     @InjectRepository(Game)
     private readonly gamesRepository: Repository<Game>,
   ) {}

   async createGame(gameData: CreateGameDto) {
     const newGame = await this.gamesRepository.create(gameData);
     await this.gamesRepository.save(newGame);
     return newGame;
   }

   async getGameById(id: number) {
    const game =  await this.gamesRepository.findOne(id);
    if (!game) {
      throw new GameNotFoundException(id);
    }
    return game;
   }

   async deleteGame(id: number) {
    const deletedGame = await this.gamesRepository.delete(id);
    if (!deletedGame.affected) {
      throw new GameNotFoundException(id);
    }
   }
 }