import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import JwtTwoFactornGuard from "src/authentication/jwt-two-factor.guard";
import RequestWithUser from "src/authentication/request-with-user.interface";
import { AchievementsHistoriesService } from "./achievements-histories.service";
import { CreateAchievementHistoryDto } from "./dto/create-achievement-history.dto";

@Controller('achievements-histories')
export class AchievementsHistoriesController {
    constructor(
        private readonly achievementsHistoriesService: AchievementsHistoriesService
    ) {}
    @Post()
    @UseGuards(JwtTwoFactornGuard)
    async add(@Body(){achievement_id} : CreateAchievementHistoryDto, @Req() request: RequestWithUser) {
        return await this.achievementsHistoriesService.create(achievement_id, request.user);
    }

    @Get("achievement/:id")
    @UseGuards(JwtTwoFactornGuard)
    async findOne(@Param('id', ParseIntPipe) id: number, @Req() request: RequestWithUser) {
        return await this.achievementsHistoriesService.getByAchievement(id, request.user);
    }
}
