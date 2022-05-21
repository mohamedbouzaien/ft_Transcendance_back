import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import Acheivement from "./acheivement.entity";
import { AcheivementController } from "./acheivements.controller";
import { AcheivementsService } from "./acheivements.service";

@Module({
    imports: [TypeOrmModule.forFeature([Acheivement])],
    exports: [AcheivementsService],
    providers: [AcheivementsService],
    controllers: [AcheivementController]
})
export class AcheivementsModule {}