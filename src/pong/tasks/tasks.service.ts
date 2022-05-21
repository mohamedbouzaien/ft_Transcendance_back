import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { PongGateway } from '../pong.gateway';


@Injectable()
export class TasksService {
  constructor(
    private readonly pongGateway: PongGateway,
  ) {}

  @Interval(1000 / 60)
  async heartBeat() {
    this.pongGateway.heartBeat();
  }

}