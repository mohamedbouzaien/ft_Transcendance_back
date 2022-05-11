import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { PongGateway } from '../pong.gateway'

@Injectable()
export class TasksService {
  constructor(
    private readonly pongGateway: PongGateway,
  ) {}

  @Interval(15)
  heartBeat() {
    this.pongGateway.heartBeat();
  }
}