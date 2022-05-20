import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { PongGateway } from '../pong.gateway';


@Injectable()
export class TasksService {
  constructor(
    private readonly pongGateway: PongGateway,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async matchMaking() {
    this.pongGateway.matchmaking();
  }

  @Cron(CronExpression.EVERY_SECOND)
  async checkPlayerSurrender() {
    this.pongGateway.checkDisconnection();
  }


  @Interval(1000 / 60)
  async heartBeat() {
    this.pongGateway.heartBeat();
  }

}