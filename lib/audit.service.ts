import { Injectable, Logger } from '@nestjs/common';
import {
  Action,
  AuditData,
  AuditLogger,
  TransportMethods,
  TransportOptions,
  Transport,
} from './interfaces';
import MethodToAction from './http-method-mapper';

@Injectable()
export class AuditService {
  private action!: Action;
  private getUserId!: (req: any) => string;
  private getResponseObjectId!: (req: any) => string;
  private entityName!: string;
  private transports: Array<Transport> = [];

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

  addTransport(name: TransportMethods, options?: TransportOptions): void {
    import(`./transports/${name}.transport`)
      .then((transport) => {
        this.transports.push(new transport.default(options));
      })
      .catch(() => {
        Logger.error(`Transport method "${name}" not supported yet!`);
      });
  }

  async log(data: AuditLogger, req: any): Promise<void> {
    Logger.log('Auditing...');

    this.setAction(MethodToAction[req.method]);
    const payload = this.constructData(data, req);

    if (this.transports.length === 0) {
      this.addTransport(TransportMethods.CONSOLE);
    }

    const transportPromises: Array<void> = [];
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
