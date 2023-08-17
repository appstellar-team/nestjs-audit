import { Action, AuditParams } from './audit-params.interface';
import { BaseTransport } from './transports.interface';

export enum Outcome {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

/**
 * Configurations passed to Audit module to specify audit options on module level.
 *
 */
export interface AuditConfig {
  /**
   * A list of transport methods that specify where audit data will be saved.
   * The list accepts BaseTransport objects containing a required name parameter for the transport
   * and an optional options parameter to define transport options
   *
   * @example
   * `transports: [{ name: TransportMethods.CONSOLE, options: { logger: new ConsoleLogger() } }];`
   *
   */
  transports: BaseTransport[];
  /**
   * A callback function that returns the user id who is performing the request based on a given input.
   *
   * @example
   * `getUserId: (req) => req.headers.user.id;`
   *
   */
  getUserId?: (req: any) => string;
  /**
   * Whether to keep audit logs for failed requests.
   * Pass `true` to override the default behavior.
   *
   * @default false
   *
   */
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
