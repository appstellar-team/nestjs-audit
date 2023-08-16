import { Action, AuditParams } from './audit-params.interface';
import { TransportMethods, TransportOptions } from './transports.interface';

export enum Outcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export interface AuditConfig {
  transports: [
    {
      name: TransportMethods;
      options?: TransportOptions;
    },
  ];
  getUserId?: (req: any) => string;
  logErrors?: boolean;
}

export interface AuditLogger {
  params: AuditParams;
  outcome: Outcome;
  err?: Error;
}

export interface AuditData {
  userId?: string;
  action: Action;
  objectId?: string;
  entity?: string;
  outcome: Outcome;
  error?: string;
  date: Date;
}
