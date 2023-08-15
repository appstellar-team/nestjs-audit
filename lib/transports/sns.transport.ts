import { PublishCommand, PublishCommandOutput } from '@aws-sdk/client-sns';
import { AuditData, SNSTransportOptions } from '../interfaces';

export default class SNSTransport {
  options: SNSTransportOptions;
  name = 'sns';

  constructor(options: SNSTransportOptions) {
    this.options = options;
  }

  async emit(data: AuditData): Promise<void> {
    await this.publish(this.options, JSON.stringify(data));
  }

  async publish(
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
