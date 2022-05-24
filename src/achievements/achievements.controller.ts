import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import JwtTwoFactornGuard from "src/authentication/jwt-two-factor.guard";
import { AchievementsService } from "./achievements.service";
import { CreateAchievementDto } from "./dto/create-achievement.dto";

@Controller('achievements')
export class AchievementController {
    constructor(private readonly achievementsService: AchievementsService) {

    }
    @Post()
    @UseGuards(JwtTwoFactornGuard)
    async   add(@Body() achievements: CreateAchievementDto[]) {
        for (let achievement of achievements) {
            await this.achievementsService.create(achievement);
        }
    }

    @Get()
    async   getAll() {
        return await this.achievementsService.getAll();
    }
}