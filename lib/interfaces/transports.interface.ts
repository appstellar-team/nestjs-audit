import { SNSClient } from '@aws-sdk/client-sns';

export interface ConsoleTransportOptions {
  logger?: any;
}

export interface SNSTransportOptions {
  client: SNSClient;
  snsTopicArn: string;
}

export interface MongooseTransportOptions {
  connectionString: string;
}
