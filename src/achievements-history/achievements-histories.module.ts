import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AchievementsModule } from "src/achievements/achievements.module";
import { AchievementsHistoriesController } from "./achievements-histories.controller";
import { AchievementsHistoriesService } from "./achievements-histories.service";
import AchievementHistory from "./achievements-history.entity";

@Module({
    imports: [TypeOrmModule.forFeature([AchievementHistory]), AchievementsModule],
    providers: [AchievementsHistoriesService],
    controllers: [AchievementsHistoriesController]
})
export class AchievementsHistoriesModule {}