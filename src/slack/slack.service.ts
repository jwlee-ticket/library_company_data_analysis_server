import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);

  constructor(private readonly configService: ConfigService) { }
  async sendMessage(message: string) {
    try {

      const slackWebhookUrl = this.configService.get<string>('SLACK_WEBHOOK_URL');

      if (!slackWebhookUrl) {
        this.logger.error('Slack webhook URL is not configured');
        throw new Error('Slack webhook URL is not configured');
      }

      const payload = { text: message };

      const response = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        this.logger.error(`Failed to send message to Slack: ${response.statusText}`);
        return {
          code: response.status,
          message: response.statusText
        }
      }

      this.logger.log('Message sent to Slack successfully');
      return {
        code: response.status,
        message: response.statusText
      }
    } catch (error) {
      this.logger.error(`Error sending message to Slack: ${error.message}`);
      return {
        code: 500,
        message: error.message
      }
    }
  }

}


