import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { PongGateway } from '../pong.gateway';


@Injectable()
export class TasksService {
  constructor(
    private readonly pongGateway: PongGateway,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  CheckPlayerSurrender() {
    this.pongGateway.checkPlayerSurrender();
  }

  @Interval(1000 / 60)
  heartBeat() {
    this.pongGateway.heartBeat();
  }
}