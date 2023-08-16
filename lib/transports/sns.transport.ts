import { PublishCommand, PublishCommandOutput } from '@aws-sdk/client-sns';
import {
  AuditData,
  SNSTransportOptions,
  TransportMethods,
  Transport,
} from '../interfaces';
import { Logger } from '@nestjs/common';

export default class SNSTransport implements Transport {
  options: SNSTransportOptions;
  name = TransportMethods.SNS;

  constructor(options: SNSTransportOptions) {
    this.options = options;
  }

  async emit(data: AuditData): Promise<void> {
    try {
      await this.publish(this.options, JSON.stringify(data));
    } catch {
      Logger.error(
        'Error sending message to topic. Please check if the provided arguments are correct',
      );
    }
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
