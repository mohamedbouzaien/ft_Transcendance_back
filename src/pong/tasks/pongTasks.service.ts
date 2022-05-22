import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PongGateway } from "../pong.gateway";

@Injectable()
export class PongTasksService {
  constructor(
    private readonly pongGateway: PongGateway,
  ) {}
  @Cron(CronExpression.EVERY_SECOND)
  async handleCron() {
    this.pongGateway.checkDisconnection();
  }
}