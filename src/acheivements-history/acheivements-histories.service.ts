import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AcheivementsService } from "src/acheivements/acheivements.service";
import User from "src/users/user.entity";
import { Repository } from "typeorm";
import AcheivementHistory from "./acheivements-history.entity";
import { CreateAcheivementHistoryDto } from "./dto/create-acheivement-history.dto";

@Injectable()
export class AcheivementsHistoriesService {
    constructor(
        @InjectRepository(AcheivementHistory) private acheivementHistoryRepository: Repository<AcheivementHistory>,
        private acheivementsService: AcheivementsService
    ) {}

    async create(acheivement_id: number, user: User) {
        const acheivement = await this.acheivementsService.get(acheivement_id);
        const acheivement_history = await this.acheivementHistoryRepository.create({
            user: user,
            acheivement: acheivement
        });
        await this.acheivementHistoryRepository.save(acheivement_history);
        return acheivement_history;
    }
}