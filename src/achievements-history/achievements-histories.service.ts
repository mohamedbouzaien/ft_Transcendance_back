import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AchievementsService } from "src/achievements/achievements.service";
import User from "src/users/user.entity";
import { Repository } from "typeorm";
import AchievementHistory from "./achievements-history.entity";

@Injectable()
export class AchievementsHistoriesService {
    constructor(
        @InjectRepository(AchievementHistory) private achievementHistoryRepository: Repository<AchievementHistory>,
        private achievementsService: AchievementsService
    ) {}

    async create(achievement_id: number, user: User) {
        const found_ach_hist = await this.getByAchievement(achievement_id, user);
        if (found_ach_hist === undefined)
        {
            const achievement = await this.achievementsService.get(achievement_id);
            const new_achievement_history = await this.achievementHistoryRepository.create({
                user: user,
                achievement: achievement
            });
            await this.achievementHistoryRepository.save(new_achievement_history);
            return new_achievement_history;
        }
    }

    async   getByAchievement(id: number, user: User) {
        return await this.achievementHistoryRepository.findOne({
            relations: ['achievement'],
            where: {
                user_id: user.id,
                achievement: {
                    id: id
                }
            }
        });
    }
}