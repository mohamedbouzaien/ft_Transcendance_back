import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';
import { ChatGateway } from '../chat.gateway';

@Injectable()
export class ChatTasksService {
  constructor(
    private readonly chatGateway: ChatGateway,
  ) {}
  @Cron(CronExpression.EVERY_SECOND)
  handleCron() {
    this.chatGateway.checkChannelUserSanction();
  }
}