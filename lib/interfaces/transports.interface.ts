import { SNSClient } from '@aws-sdk/client-sns';
import { AuditData } from './audit.interface';

export interface Transports {
  name: string;
  options?: any;
  emit(data: AuditData): void;
}

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
