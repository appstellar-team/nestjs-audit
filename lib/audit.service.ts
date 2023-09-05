import { Injectable, Logger } from '@nestjs/common';
import {
  Action,
  AuditData,
  AuditLogger,
  TransportMethods,
  TransportOptions,
  Transport,
  BaseTransport,
} from './interfaces';
import MethodToAction from './http-method-mapper';

/**
 * Service class providing audit capabilities.
 *
 */
@Injectable()
export class AuditService {
  private action!: Action;
  private getUserId!: (req: any) => string;
  private getResponseObjectId!: (req: any) => string;
  private entityName!: string;
  private transports: Array<BaseTransport> = [];

  /**
   * Whether to keep audit logs for failed requests. Defaults to `false`.
   *
   * @default false
   *
   */
  public logErrors = false;

  /**
   * Get action value
   *
   * @example
   * `const action = this.auditService.getAction();`
   *
   */
  getAction(): Action {
    return this.action;
  }

  /**
   * Set action value to one of the provided `Action` values.
   *
   * @example
   * `const action = this.auditService.setAction(Action.CREATE);`
   *
   * @param action value to set
   *
   */
  setAction(action: Action): void {
    this.action = action;
  }

  /**
   * Get the function that returns the user id
   *
   * @example
   * `const getUserId = this.auditService.getUserIdCallback();`
   *
   */
  getUserIdCallback(): (req: any) => string {
    return this.getUserId;
  }

  /**
   * Defines a function that returns the user id based on a given input.
   *
   * @example
   * `const getUserId = this.auditService.setUserIdCallback((req) => req.headers.user.id);`
   *
   * @param callback function which returns user id
   *
   */
  setUserIdCallback(callback: any): void {
    this.getUserId = callback;
  }

  /**
   * Get the function that returns the response object id
   *
   * @example
   * `const getResponseObjectId = this.auditService.getResponseObjectIdCallback();`
   *
   */
  getResponseObjectIdCallback(): (req: any) => string {
    return this.getResponseObjectId;
  }

  /**
   * Defines a function that returns the object id based on a given input.
   *
   * @example
   * `const getResponseObjectId = this.auditService.setResponseObjectIdCallback((res) => res.object.id);`
   *
   * @param callback function which returns response object id
   *
   */
  setResponseObjectIdCallback(callback: any): void {
    this.getResponseObjectId = callback;
  }

  /**
   * Get entity name
   *
   * @example
   * `const entityName = this.auditService.getEntityName();`
   *
   */
  getEntityName(): string {
    return this.entityName;
  }

  /**
   * Sets the name of entity where a request is performed.
   *
   * @example
   * `const entityName = this.auditService.setEntityName('users');`
   *
   * @param name entity
   *
   */
  setEntityName(name: string): void {
    this.entityName = name;
  }

  /**
   * Get list of transport options
   *
   * @example
   * `const transports = this.auditService.getTransports();`
   *
   */
  getTransports(): Array<BaseTransport> {
    return this.transports;
  }

  /**
   * Specify where audit data will be saved.
   *
   * @example
   * `this.auditService.addTransport(TransportMethods.CONSOLE, { logger: new ConsoleLogger() });`
   *
   * @param name one of TransportMethods enum values
   * @param options additional trnasport information like connection string for database transport or topic arn for sns transport
   *
   */
  addTransport(name: TransportMethods, options?: TransportOptions): void {
    this.transports.push({ name, options });
  }

  async log(data: AuditLogger, req: any): Promise<void> {
    Logger.log('Auditing...');

    this.setAction(MethodToAction[req.method]);
    const payload = this.constructData(data, req);

    if (this.transports.length === 0) {
      this.addTransport(TransportMethods.CONSOLE);
    }

    const transportPromises: Array<void> = [];
    this.transports.forEach(async (transport: BaseTransport) => {
      const transportClass = await this.importTransportClass(transport);
      Logger.log(`Emitting data to "${transport.name}"`);
      transportPromises.push(transportClass.emit(payload));
    });

    await Promise.all(transportPromises);
    Logger.log('Auditing complete!');
  }

  private async importTransportClass(
    transport: BaseTransport,
  ): Promise<Transport> {
    const Transport = await import(`./transports/${transport.name}.transport`);
    return new Transport.default(transport.options);
  }

  private constructData(data: AuditLogger, req: any): AuditData {
    return {
      userId: data.params.getUserId?.(req) || this.getUserId?.(req),
      action: data.params.action || this.action,
      objectId:
        data.params.getResponseObjectId?.(req) ||
        this.getResponseObjectId?.(req),
      entity: data.params.entity || this.entityName,
      outcome: data.outcome,
      error: data.err && `${data.err?.name} ${data.err?.message}`,
      date: new Date(),
    };
  }
}
