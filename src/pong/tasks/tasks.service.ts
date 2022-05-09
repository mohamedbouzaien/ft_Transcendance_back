import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { PongGateway } from '../pong.gateway';

@Injectable()
export class TasksService {
  constructor(
    private readonly pongGateway: PongGateway,
  ) {}

  @Interval(33)
  heartBeat() {
    this.pongGateway.heartBeat();
  }

  @Interval(33)
  heartbeatBall(){
    this.pongGateway.heartbeatBall();
  }
}