import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Duel } from "./entities/duel.entity";
import { DuelsService } from "./services/duel.service";

@Module({
  imports: [TypeOrmModule.forFeature([Duel])],
  providers: [DuelsService],
  exports: [DuelsService]
})
export class DuelModule{};