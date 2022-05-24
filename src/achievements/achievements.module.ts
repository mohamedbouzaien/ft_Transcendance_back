import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import Achievement from "./achievement.entity";
import { AchievementController } from "./achievements.controller";
import { AchievementsService } from "./achievements.service";

@Module({
    imports: [TypeOrmModule.forFeature([Achievement])],
    exports: [AchievementsService],
    providers: [AchievementsService],
    controllers: [AchievementController]
})
export class AchievementsModule {}