import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AcheivementsModule } from "src/acheivements/acheivements.module";
import { AcheivementsHistoriesController } from "./acheivements-histories.controller";
import { AcheivementsHistoriesService } from "./acheivements-histories.service";
import AcheivementHistory from "./acheivements-history.entity";

@Module({
    imports: [TypeOrmModule.forFeature([AcheivementHistory]), AcheivementsModule],
    providers: [AcheivementsHistoriesService],
    controllers: [AcheivementsHistoriesController]
})
export class AcheivementsHistoriesModule {}