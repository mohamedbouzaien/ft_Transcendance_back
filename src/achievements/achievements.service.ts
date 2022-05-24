import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Achievement from "./achievement.entity";
import { CreateAchievementDto } from "./dto/create-achievement.dto";

@Injectable()
export class AchievementsService {
    constructor(
        @InjectRepository(Achievement)
        private achievementsRepository: Repository<Achievement>
    ) {}

    async create(achievementData: CreateAchievementDto) {
        const achievement = await this.achievementsRepository.create(achievementData);
        await this.achievementsRepository.save(achievement);
        return achievement;
    }

    async get(id: number) {
        return await this.achievementsRepository.findOne({id});
    }

    async getAll() {
        return await this.achievementsRepository.find();
    }
}