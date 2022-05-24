import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AcheivementsService } from "src/acheivements/acheivements.service";
import User from "src/users/user.entity";
import { Repository } from "typeorm";
import AcheivementHistory from "./acheivements-history.entity";

@Injectable()
export class AcheivementsHistoriesService {
    constructor(
        @InjectRepository(AcheivementHistory) private acheivementHistoryRepository: Repository<AcheivementHistory>,
        private acheivementsService: AcheivementsService
    ) {}

    async create(acheivement_id: number, user: User) {
        const found_ach_hist = await this.getByAcheivement(acheivement_id, user);
        if (found_ach_hist === undefined)
        {
            const acheivement = await this.acheivementsService.get(acheivement_id);
            const new_acheivement_history = await this.acheivementHistoryRepository.create({
                user: user,
                acheivement: acheivement
            });
            await this.acheivementHistoryRepository.save(new_acheivement_history);
            return new_acheivement_history;
        }
    }

    async   getByAcheivement(id: number, user: User) {
        return await this.acheivementHistoryRepository.findOne({
            relations: ['acheivement'],
            where: {
                user_id: user.id,
                acheivement: {
                    id: id
                }
            }
        });
    }
}