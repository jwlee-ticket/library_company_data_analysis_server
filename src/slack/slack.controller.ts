import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SlackService } from './slack.service';
import { DailyPerformanceReport } from '../report/interface/report.interface';
import { Logger } from '@nestjs/common';

@Controller('slack')
export class SlackController {
  private readonly logger = new Logger(SlackController.name);

  constructor(private readonly slackService: SlackService) { }

  @Post('send-message')
  async sendMessage(@Body('message') message: string) {
    return this.slackService.sendMessage(message);
  }
}
