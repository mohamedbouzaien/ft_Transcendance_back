import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import User from "src/users/user.entity";
import { IsNull, Not, Repository } from "typeorm";
import CreateDuelDto from "../dto/createDuel.dto";
import { Duel } from "../entities/duel.entity";
import { DuelNotFoundException } from "../exception/DuelNotFound.exception";

@Injectable()
export class DuelsService {
  constructor(
    @InjectRepository(Duel)
    private readonly DuelsRepository: Repository<Duel>
    ) {}

    async getDuelById(id: number) {
      const Duel = this.DuelsRepository.findOne(id, {relations: ['sender', 'receiver']});
      if (!Duel) {
        throw new DuelNotFoundException(id);
      }
      return (Duel);
    }

    async getAllUserDuels(user: User) {
      return await this.DuelsRepository.find({
        where: [
          {sender: user},
          {receiver: user}]
      })
    }

    async getSpecificDuel(user1: User, user2: User) {
      return await this.DuelsRepository.find({
        where: [
          {sender: user1, receiver: user2},
          {sender: user2, receiver: user1}]
      })
    }
    async createDuel(DuelData: CreateDuelDto) {
      const newDuel = await this.DuelsRepository.create({
        ...DuelData,
      });
      await this.DuelsRepository.save(newDuel);
      return newDuel;
    }

    async deleteDuel(id: number) {
      const deleted_Duel = await this.DuelsRepository.delete(id);
      if (!deleted_Duel.affected) {
        throw new DuelNotFoundException(id);
      }
      return deleted_Duel;
    }
}