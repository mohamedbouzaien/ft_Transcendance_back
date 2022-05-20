import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import JwtTwoFactornGuard from "src/authentication/jwt-two-factor.guard";
import { AcheivementsService } from "./acheivements.service";
import { CreateAcheivementDto } from "./dto/create-acheivement.dto";

@Controller('acheivements')
export class AcheivementController {
    constructor(private readonly acheivementsService: AcheivementsService) {

    }
    @Post()
    @UseGuards(JwtTwoFactornGuard)
    async   add(@Body() acheivements: CreateAcheivementDto[]) {
        for (let acheivement of acheivements) {
            await this.acheivementsService.create(acheivement);
        }
    }

    @Get()
    async   getAll() {
        return await this.acheivementsService.getAll();
    }
}