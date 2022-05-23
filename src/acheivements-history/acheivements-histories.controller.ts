import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import JwtTwoFactornGuard from "src/authentication/jwt-two-factor.guard";
import RequestWithUser from "src/authentication/request-with-user.interface";
import { AcheivementsHistoriesService } from "./acheivements-histories.service";
import { CreateAcheivementHistoryDto } from "./dto/create-acheivement-history.dto";

@Controller('acheivements-histories')
export class AcheivementsHistoriesController {
    constructor(
        private readonly acheivementsHistoriesService: AcheivementsHistoriesService
    ) {}
    @Post()
    @UseGuards(JwtTwoFactornGuard)
    async add(@Body(){acheivement_id} : CreateAcheivementHistoryDto, @Req() request: RequestWithUser) {
        return await this.acheivementsHistoriesService.create(acheivement_id, request.user);
    }

    @Get("acheivement/:id")
    @UseGuards(JwtTwoFactornGuard)
    async findOne(@Param('id', ParseIntPipe) id: number, @Req() request: RequestWithUser) {
        return await this.acheivementsHistoriesService.getByAcheivement(id, request.user);
    }
}
