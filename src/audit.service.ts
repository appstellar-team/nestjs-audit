import { Injectable, Logger } from '@nestjs/common';
import { Action, AuditData, AuditLogger } from './interfaces';
import MethodToAction from './http-method-mapper';
import * as Transports from './transports';

@Injectable()
export class AuditService {
  private action!: Action;
  private userId!: (req: any) => string;
  private repsonseObjectId!: (req: any) => string;
  private entityName!: string;

  logErrors = false;
  transports: Array<any> = [];

  setAction(action: Action): void {
    this.action = action;
  }

  setUserId(callback: any): void {
    this.userId = callback;
  }

  setResponseObjectId(callback: any): void {
    this.repsonseObjectId = callback;
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

  log(data: AuditLogger, req: any): void {
    Logger.log('Auditing...');

    this.setAction(MethodToAction[req.method]);
    const payload = this.constructData(data, req);

    console.log('Transports: ', this.transports);

    if (this.transports.length === 0) {
      this.addTransport('console');
    }

    this.transports.forEach(async (transport) => {
      console.log('emitting...');
      await transport.emit(payload);
    });
  }

  constructData(data: AuditLogger, req: any): AuditData {
    return {
      userId: data.params.userId?.(req) || this.userId?.(req),
      action: data.params.action || this.action,
      objectId:
        data.params.responseObjectId?.(req) || this.repsonseObjectId?.(req),
      entity: data.params.entity || this.entityName,
      outcome: data.outcome,
      error: data.err && `${data.err?.name} ${data.err?.message}`,
      date: new Date(),
    };
  }
}
