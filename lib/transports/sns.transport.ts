import { PublishCommand, PublishCommandOutput } from '@aws-sdk/client-sns';
import { AuditData, SNSTransportOptions } from '../interfaces';
import { Logger } from '@nestjs/common';

export default class SNSTransport {
  options: SNSTransportOptions;
  name = 'sns';

  constructor(options: SNSTransportOptions) {
    this.options = options;
  }

  async emit(data: AuditData): Promise<void> {
    const response = await this.publish(this.options, JSON.stringify(data));
    Logger.log('AWS Response: ', JSON.stringify(response));
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
