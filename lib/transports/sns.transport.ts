import { PublishCommand, PublishCommandOutput } from '@aws-sdk/client-sns';
import { AuditData, SNSTransportOptions, Transports } from '../interfaces';

export default class SNSTransport implements Transports {
  options: SNSTransportOptions;
  name = 'sns';

  constructor(options: SNSTransportOptions) {
    this.options = options;
  }

  async emit(data: AuditData): Promise<void> {
    await this.publish(this.options, JSON.stringify(data));
  }

  private async publish(
    options: SNSTransportOptions,
    message: string,
  ): Promise<PublishCommandOutput> {
    const command = new PublishCommand({
      TopicArn: options.snsTopicArn,
      Message: message,
    });
    return await options.client.send(command);
  }
}
