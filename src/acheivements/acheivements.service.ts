import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import User from "src/users/user.entity";
import { Repository } from "typeorm";
import Acheivement from "./acheivement.entity";
import { CreateAcheivementDto } from "./dto/create-acheivement.dto";

@Injectable()
export class AcheivementsService {
    constructor(
        @InjectRepository(Acheivement)
        private acheivementsRepository: Repository<Acheivement>
    ) {}

    async create(acheivementData: CreateAcheivementDto) {
        const acheivement = await this.acheivementsRepository.create(acheivementData);
        await this.acheivementsRepository.save(acheivement);
        return acheivement;
    }

    async get(id: number) {
        return await this.acheivementsRepository.findOne({id});
    }

    async getAll() {
        return await this.acheivementsRepository.find();
    }
}