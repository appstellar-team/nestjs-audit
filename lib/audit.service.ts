import { Injectable, Logger } from '@nestjs/common';
import { Action, AuditData, AuditLogger } from './interfaces';
import MethodToAction from './http-method-mapper';
import * as Transports from './transports';

@Injectable()
export class AuditService {
  private action!: Action;
  private getUserId!: (req: any) => string;
  private getResponseObjectId!: (req: any) => string;
  private entityName!: string;
  private transports: Array<any> = [];

  public logErrors = false;

  setAction(action: Action): void {
    this.action = action;
  }

  setUserIdCallback(callback: any): void {
    this.getUserId = callback;
  }

  setResponseObjectIdCallback(callback: any): void {
    this.getResponseObjectId = callback;
  }

  setEntityName(name: string): void {
    this.entityName = name;
  }

  addTransport(name: string, options: any = {}): void {
    switch (name) {
      case 'console':
        this.transports.push(new Transports.ConsoleTransport(options));
        break;
      case 'mongoose':
        if (!options.connectionString) {
          Logger.error('Missing argument "connectionString"!');
          return;
        }
        this.transports.push(new Transports.MongooseTransport(options));
        break;
      case 'sns':
        if (!options.client || !options.snsTopicArn) {
          Logger.error('Missing argument "client" or "snsTopicArn"!');
          return;
        }
        this.transports.push(new Transports.SNSTransport(options));
        break;
      default:
        Logger.error(`Transport method "${name}" not supported yet!`);
    }
  }

  async log(data: AuditLogger, req: any): Promise<void> {
    Logger.log('Auditing...');

    this.setAction(MethodToAction[req.method]);
    const payload = this.constructData(data, req);

    if (this.transports.length === 0) {
      this.addTransport('console');
    }

    const transportPromises: Array<any> = [];
    this.transports.forEach((transport) => {
      Logger.log(`Emitting data to "${transport.name}"`);
      transportPromises.push(transport.emit(payload));
    });

    await Promise.all(transportPromises);
    Logger.log('Auditing complete!');
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
